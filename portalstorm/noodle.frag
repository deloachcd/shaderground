#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec4 u_date;
uniform float u_time;

float spike_gradient(float iterable, float min_value, float max_value) {
    float half_value_range = max_value - min_value;
    float value_range = half_value_range * 2.0;
    float gradient_value = mod(iterable, value_range);
    if (gradient_value > half_value_range) {
        gradient_value = value_range - gradient_value;
    }
    return gradient_value;
}

float get_slope(vec2 lower_pt, vec2 higher_pt) {
    return (higher_pt.y - lower_pt.y) / (higher_pt.x - lower_pt.x);
}

bool pixel_in_line(vec2 coord, vec2 pt1, vec2 pt2, float thickness) {
    bool rval = false;
    if (coord.y >= min(pt1.y, pt2.y) && coord.y <= max(pt1.y, pt2.y)) {
        float slope = (pt1.y - pt2.y) / (pt1.x - pt2.x);
        float y_intercept = pt1.y - slope*pt1.x;
        if (distance(coord, vec2(coord.x, (slope*coord.x)+y_intercept)) < thickness) {
            rval = true;
        }
    }
    return rval;
}

void main() {
    vec2 coord = gl_FragCoord.xy/u_resolution;
    const int N_JOINTS = 5;
    const float TOLERANCE = 0.005;
    float joint_sector_h = 1.0/float(N_JOINTS);
    vec2 joints[4];
    vec3 color = vec3(0.0);

    float g = spike_gradient(u_time/2.0, 0.0, 0.2);
    // defined in reverse order just for visual consistency
    joints[3] = vec2(0.6-g, 0.8);
    joints[2] = vec2(0.4+g, 0.6);
    joints[1] = vec2(0.6-g, 0.4);
    joints[0] = vec2(0.4+g, 0.2);

    if (pixel_in_line(coord, joints[0], joints[1], TOLERANCE)) {
        color = vec3(1.0, 0.0, 0.0);
    }
    if (pixel_in_line(coord, joints[1], joints[2], TOLERANCE)) {
        color = vec3(0.0, 0.5, 1.0);
    }
    if (pixel_in_line(coord, joints[2], joints[3], TOLERANCE)) {
        color = vec3(0.0, 0.5, 1.0);
    }

    gl_FragColor = vec4(color, 1.0);
}
