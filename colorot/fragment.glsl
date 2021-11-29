#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;

mat2 rot_2d_mat(float degs) {
    return mat2(cos(degs), -sin(degs), sin(degs), cos(degs));
}

void main() {
    float theta = u_time % 360.0;
    mat2 frame_rot_mat = rot_2d_mat(theta);
    float src_mag = 0.5f * sin(theta);

    vec2 red_src = vec2(0.0f, src_mag) * frame_rot_mat + 0.3f;
    vec2 blue_src = vec2(-src_mag, -src_mag) * frame_rot_mat + 0.1f;
    vec2 green_src = vec2(src_mag, -0.5f) * frame_rot_mat + 0.2f;
    vec2 white_src = vec2(-0.0f, -0.75f);

    float r = distance(gl_Position.xy, red_src) - 0.9f;
    float g = distance(gl_Position.xy, green_src) - 0.9f;
    float b = distance(gl_Position.xy, blue_src) - 0.9f;

    gl_FragColor = vec4(r, g, b, 1.0f);
}
