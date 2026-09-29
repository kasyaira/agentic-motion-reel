import React, { useRef, useEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../tokens';

/**
 * 13 — SHADER / GENERATIVE
 * Hand-written GLSL fragment shaders rendered through raw WebGL —
 * first a domain-warped FBM flow field, then a polar tunnel.
 * The uniform clock IS the frame number: deterministic, reproducible.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_mode;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(11.7, 5.3);
    a *= 0.5;
  }
  return v;
}
const vec3 CHARCOAL = vec3(0.040, 0.040, 0.048);
const vec3 EMBER    = vec3(1.000, 0.290, 0.122);
const vec3 BONE     = vec3(0.957, 0.945, 0.918);
vec3 palette(float t) {
  vec3 c = mix(CHARCOAL, EMBER, smoothstep(0.35, 0.85, t));
  return mix(c, BONE, smoothstep(0.92, 1.0, t));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;
  if (u_mode < 0.5) {
    // domain-warped flow
    float t = u_time * 0.18;
    vec2 q = vec2(fbm(uv * 1.6 + t), fbm(uv * 1.6 + vec2(4.7, 1.3) - t));
    vec2 r = vec2(fbm(uv * 1.6 + 2.4 * q + vec2(1.7, 9.2) + t * 0.6),
                  fbm(uv * 1.6 + 2.4 * q + vec2(8.3, 2.8) - t * 0.4));
    float f = fbm(uv * 1.6 + 2.8 * r);
    vec3 col = palette(clamp(f * f * 2.1, 0.0, 1.0));
    col += palette(q.x) * 0.28;
    gl_FragColor = vec4(col, 1.0);
  } else {
    // polar tunnel
    float t = u_time * 0.9;
    float a = atan(uv.y, uv.x);
    float r = length(uv);
    float rings = 0.5 + 0.5 * sin(10.0 * log(r + 0.12) - t * 2.2);
    float spokes = 0.5 + 0.5 * sin(9.0 * a + t * 0.8 + 2.0 * sin(r * 5.0 - t));
    float v = rings * spokes;
    v *= smoothstep(0.05, 0.7, r);
    float glow = pow(v, 2.4);
    vec3 col = palette(clamp(0.15 + glow * 1.4, 0.0, 1.0));
    col += EMBER * pow(1.0 - r, 3.0) * 0.35;
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

export const S13Shader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    uniforms: Record<string, WebGLUniformLocation | null>;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || glRef.current) return;
    // WebGL2 preferred (swangle headless), WebGL1 fallback
    const gl = (canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true }) ||
      canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true })) as WebGLRenderingContext | null;
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      const ok = gl.getShaderParameter(s, gl.COMPILE_STATUS);
      if (!ok) console.error('SHADER COMPILE FAIL:', gl.getShaderInfoLog(s));
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) console.error('LINK LOG:', gl.getProgramInfoLog(program));
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    glRef.current = {
      gl,
      program,
      uniforms: {
        u_res: gl.getUniformLocation(program, 'u_res'),
        u_time: gl.getUniformLocation(program, 'u_time'),
        u_mode: gl.getUniformLocation(program, 'u_mode'),
      },
    };
  }, []);

  useEffect(() => {
    const c = glRef.current;
    if (!c) return;
    const { gl, uniforms } = c;
    gl.viewport(0, 0, 1920, 1080);
    gl.uniform2f(uniforms.u_res!, 1920, 1080);
    gl.uniform1f(uniforms.u_time!, frame / fps);
    gl.uniform1f(uniforms.u_mode!, frame < 150 ? 0 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, [frame, fps]);

  const mode = frame < 150 ? 'FBM FLOW — DOMAIN WARPING' : 'POLAR TUNNEL — 5 OCTAVES';
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} width={1920} height={1080} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', left: 96, bottom: 88, fontFamily: FONTS.mono, fontSize: 22, color: 'rgba(244,241,234,0.75)', letterSpacing: '0.18em' }}>
        GLSL — {mode} — u_time = frame / {fps}
      </div>
    </AbsoluteFill>
  );
};
