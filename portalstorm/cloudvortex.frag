#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926535897932384626433832795

uniform vec2 u_resolution;
uniform float u_time;

mat2 rotation2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(
        c, -s,
        s, c
    );
}

float get_ellipse_y(float x, vec2 center, float width, float height, float _sign) {
    float xh = x - center.x;
    float xh_2 = xh * xh;
    float w_2 = width * width;
    float h_2 = height * height;
    return center.y + (_sign * sqrt(h_2*(1.0 - (xh_2/w_2))));
}

bool pixel_in_ellipse_radius(vec2 coord, vec2 center_pt, float width, float height,
                             float thickness) {
    bool pixel_in_upper_hemisphere = (
        distance(coord.y,
                 get_ellipse_y(coord.x, center_pt, width, height, 1.0)) < thickness
    );
    bool pixel_in_lower_hemisphere = (
        distance(coord.y,
                 get_ellipse_y(coord.x, center_pt, width, height, -1.0)) < thickness  
    );
    return pixel_in_upper_hemisphere || pixel_in_lower_hemisphere;
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 8
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.9;
    float lacunarity = 2.;
    float gain = .5;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(frequency*st);
        frequency *= lacunarity;
        amplitude *= gain;
    }
    return value;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    float t = u_time/1000.0;
    const float threshold = 0.999;
    float theta;
    float t_shift = mod(u_time, 360.0);
    const float THETA_MAX = 60.0;

    theta = THETA_MAX * (1.0 - distance(st, vec2(0.5, 0.5)));
    float rad = PI/180.0;
    st = rotation2d((theta+t_shift) * rad) * st;
    // v1 -> e1 - single iteration of fbm, OCTAVES times
    vec2 v1 = vec2(0.0);
    v1.x = fbm(st*3.0);
    v1.y = fbm(st*1.67);
    float e1 = (v1.x+v1.y)/2.0;

    // v2 -> e2 - two iterations of fbm, OCTAVES times
    vec2 v2 = vec2(0.0);
    v2.x = fbm(v1*2.73*t);
    v2.y = fbm(v1*3.11*t);
    float e2 = (v2.x+v2.y)/2.0;

    vec3 color = vec3(e1);
    if (pixel_in_ellipse_radius(st, vec2(0.5, 0.5), 0.3, 0.2, 0.01)) {
        color.b = 1.0;
    }

    gl_FragColor = vec4(color,1.0);
}
