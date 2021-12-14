#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  u_light;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec4  u_date;

varying vec4 v_position;

#ifdef MODEL_VERTEX_NORMAL
varying vec3    v_normal;
#endif

void main(void) {
    vec3 color = vec3(0.0);

#ifdef MODEL_VERTEX_NORMAL
    vec3 n = normalize(v_normal);
    vec3 l = normalize(u_light);
    float diffuse; // = (dot(n, l) + 1.0 ) * 0.5;
#endif

#ifndef BACKGROUND
    color = vec3(1.0);
#ifdef MODEL_VERTEX_NORMAL
    if (v_normal == vec3(0.0, 1.0, 0.0)) {
        vec3 p = normalize(v_position);
        diffuse = (dot(p, l) + 1.0 ) * 0.5;
    } else {
        diffuse = (dot(n, l) + 1.0 ) * 0.5;
    }
    color *= diffuse;
#endif
#endif

    gl_FragColor = vec4(color, 1.0);
}
