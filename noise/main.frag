#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_date;
uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

float rand(vec2 co) {
    // generate a random value based on the seconds in the day that have
    // passed when loading the shader
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (u_date.w - u_time));
}

bool values_match(float v1, float v2, float tolerance) {
    return v1 < v2 + tolerance && v1 > v2 - tolerance;
}

void main() {
    vec2 coord = gl_FragCoord.xy/u_resolution;
    vec4 texRGB = texture2D(u_tex0, coord);
    float tolerance = 0.001;

    float r = rand(coord);

    gl_FragColor = vec4(r, 0.0, 0.0, 1.0);
    /*
    int max_peaks = 100;
    float delta = 1.0/max_peaks;
    float render_value = 0.0;
    for (int i; i < 100; i++) {
        if (coord.x < 0.9 && coord.y < 0.9 && coord.x > 0.1 && coord.y > 0.1) {
            if (values_match(coord.x, render_value, tolerance)
                    && values_match(coord.y, render_value, tolerance)) {
                r = 1.0;
            }
        }
        render_value += delta;
    }

    //float g = rand(coord.xy);
    //float b = rand(coord.yx);

    float alpha = 1.0;

    vec4 color;
    if (texRGB.x > 0.99) {
        color = texRGB;
    } else {
        color = vec4(0.0, 0.0, 0.0, 1.0);
    }
    gl_FragColor = color;
    //gl_FragColor = vec4(r, 0.0, 0.0, alpha);
    */
}
