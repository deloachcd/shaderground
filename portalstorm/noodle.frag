#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec4 u_date;
uniform float u_time;

bool pixel_in_bezier_quad_2d(vec2 coord, vec2 a, vec2 b, vec2 c, float t,
                             float tolerance) {
    /* Formula:
       P = A(1-t)^2 + 2Bt(1-t) + Ct^2
       t represents 'progress' from point A to C
     */

    // TODO Implement this in a program where it will actually be useful
    return false;
}

bool pixel_in_VCB(vec2 coord, vec2 a, vec2 b, vec2 c, vec2 d,
                  float min_t, float max_t, float tolerance) {
    /* "VCB" --> Vertical Cubic Bezier
       This a simple, 2 dimensional bezier curve in which control point D
       is strictly higher on the Y-axis than control point A, so that I
       can easily render points along the vertical line segment from A to D
       quickly without sampling.

       Formula:
       P = A(1-t)^3 + 3Bt(1-t)^2 + 3Ct^2(1-t) + Dt^3
       t represents 'progress' from point A to D
    */

    // normalize coord height over distance between D and A to approximate t
    float t = (coord.y - a.y) / (d.y - a.y);

    if (t >= 0.0 && t <= 1.0 && t >= min_t && t <= max_t) {
        // terms in bezier curve formula precomputed to save multiplications
        float ti = 1.0 - t;
        float ti_2 = ti * ti;
        float ti_3 = ti_2 * ti;
        float t_2 = t * t;
        float t_3 = t_2 * t;

        // apply the formula for cubic bezier curves to determine if pixel coord
        // is within render distance
        float curve_pt = (a.x*ti_3) + (3.0*b.x*t*ti_2) + (3.0*c.x*t_2*ti) + (d.x*t_3);
        if (distance(coord.x, curve_pt) < tolerance) {
            return true;
        }
    }

    return false;
}

bool pixel_in_ellipse_border(vec2 coord, vec2 center_pt, float width, float height,
                             float thickness) {
    float xh_2 = (coord.x - center_pt.x) * (coord.x - center_pt.y);
    float w_2 = width * width;
    float h_2 = height * height;
    bool pixel_in_upper_hemisphere = (
        distance(coord.y, center_pt.y + sqrt(h_2*(1.0 - (xh_2/w_2)))) < thickness
    );
    bool pixel_in_lower_hemisphere = (
        distance(coord.y, center_pt.y - sqrt(h_2*(1.0 - (xh_2/w_2)))) < thickness  
    );
    return pixel_in_upper_hemisphere || pixel_in_lower_hemisphere;
}

float sawtooth_gradient(float iterable, float min_value, float max_value) {
    float gradient_value = mod(iterable, max_value-min_value);
    return min_value + gradient_value;
}

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

    float g = spike_gradient(u_time/10.0, 0.0, 0.2);
    float t = sawtooth_gradient(u_time/2.0, 0.0, 2.0);
    // defined in reverse order just for visual consistency
    joints[3] = vec2(0.5, 0.8);
    joints[2] = vec2(0.4+g, 0.6);
    joints[1] = vec2(0.5, 0.5);
    joints[0] = vec2(0.5, 0.2);

    if (pixel_in_line(coord, joints[0], joints[1], TOLERANCE/5.0)) {
        color = vec3(1.0, 0.0, 0.0);
    }
    if (pixel_in_line(coord, joints[1], joints[2], TOLERANCE/5.0)) {
        color = vec3(1.0, 0.0, 0.0);
    }
    if (pixel_in_line(coord, joints[2], joints[3], TOLERANCE/5.0)) {
        color = vec3(1.0, 0.0, 0.0);
    }
    if (pixel_in_ellipse_border(coord, vec2(0.5, 0.6), 0.2, 0.01, TOLERANCE/5.0)) {
        color = vec3(0.0, 0.3, 1.0);
    }

    if (t < 1.0) {
        if (pixel_in_VCB(coord, joints[0], joints[1], joints[2],
                         joints[3], t, 1.0, TOLERANCE)) {
            color = vec3(1.0, 1.0, 1.0);
        }
    } else {
        t = t - 1.0;
        if (pixel_in_VCB(coord, joints[0], joints[1], joints[2],
                         joints[3], 0.0, t, TOLERANCE)) {
            color = vec3(1.0, 1.0, 1.0);
        }
    }

    gl_FragColor = vec4(color, 1.0);
}
