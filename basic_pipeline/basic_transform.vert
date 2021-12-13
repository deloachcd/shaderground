#ifdef GL_ES
precision mediump float;
#endif

uniform float    u_time;
uniform vec4     u_date;

uniform mat4 u_modelViewProjectionMatrix;

attribute vec4   a_position;
varying vec4     v_position;

#ifdef MODEL_VERTEX_NORMAL
attribute vec3   a_normal;
varying vec3     v_normal;
#endif

void main(void) {
    v_position = a_position;

#ifdef MODEL_VERTEX_NORMAL
    v_normal = a_normal;
    if (v_normal == vec3(0.0, 1.0, 0.0)) {
        v_position.y += 0.5;
    }
#endif

    vec4 n = normalize(v_position);

    gl_Position = u_modelViewProjectionMatrix * v_position;
}
