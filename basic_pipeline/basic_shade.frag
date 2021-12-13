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

#ifdef BACKGROUND
    color = vec3(1.0);
#else
    color = vec3(0.0);
    if (v_normal == vec3(0.0, 1.0, 0.0)) {
        color = vec3(1.0, 0.0, 0.0);
    }
#endif

    gl_FragColor = vec4(color, 1.0);
}
