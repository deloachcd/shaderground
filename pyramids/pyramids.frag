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
        const float ROW_HEIGHT = 0.1;
        const int N_COLS = 5;
        const float ADJUST = 0.0001;
        const float TOLERANCE = 0.001;
        float COL_WIDTH = 1.0/float(N_COLS);
        int N_ROWS = int(floor(1.0/ROW_HEIGHT));

        // on top plane
        vec3 p = normalize(v_position);
        diffuse = (dot(p, l) + 1.0 ) * 0.5;
        vec2 coord = v_position.zx;
        // I lifted these values straight from the OBJ mesh data, don't know if
        // there's a 'cleaner' way to do this but hey, it works.
        coord.x += 6.053;
        coord.y += 6.1318;
        coord.x /= 6.053 + 6.051;
        coord.y /= 6.13 + 6.002;

        color = vec3(coord.x, coord.y, 0.0);
        diffuse = (dot(n, l) + 1.0 ) * 0.5;
    } else {
        diffuse = (dot(n, l) + 1.0 ) * 0.5;
    }
    color *= diffuse;
#endif
#endif

    gl_FragColor = vec4(color, 1.0);
}
