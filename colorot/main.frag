#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

mat2 rot_2d_mat(float degs) {
    return mat2(cos(degs), -sin(degs), sin(degs), cos(degs));
}

void main() {
    float theta = mod(u_time, 360.0);
    vec2 coord = gl_FragCoord.xy/u_resolution;
    mat2 frame_rot_mat = rot_2d_mat(theta);
    float src_mag = 0.5;
    float strength = 0.15;
    float shift = 0.5;
    float variability = 0.1 * sin(theta);

    vec2 red_src = vec2(0.0, src_mag) * frame_rot_mat + shift - variability;
    vec2 blue_src = vec2(-src_mag, -src_mag) * frame_rot_mat + shift - variability;
    vec2 green_src = vec2(src_mag, -0.5) * frame_rot_mat + shift - variability;

    float r = 1.0 - distance(coord, red_src) + strength;
    float g = 1.0 - distance(coord, green_src) + strength;
    float b = 1.0 - distance(coord, blue_src) + strength;

    gl_FragColor = vec4(r, g, b, 1.0);
}
