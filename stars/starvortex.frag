#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926535897932384626433832795

uniform vec2 u_resolution;
uniform float u_time;

float random (vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

mat2 rotation2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(
        c, -s,
        s, c
    );
}

void main() {
    vec2 coord = gl_FragCoord.xy/u_resolution;
    const float threshold = 0.999;
    vec3 color = vec3(0.0);
    float rot_strength;
    float theta;
    float t_shift = mod(u_time/100000.0, 360.0);
    const float THETA_MAX = 90.0;

    rot_strength = 1.0 - distance(coord, vec2(0.5, 0.5));
    theta = THETA_MAX * rot_strength;
    float rad = PI/180.0;
    coord = rotation2d((theta+t_shift) * rad) * coord;
    if (random(coord) >= threshold) {
        color = vec3(1.0);
    }


    gl_FragColor = vec4(color, 1.0);
}
