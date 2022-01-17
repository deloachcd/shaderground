#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_date;

// math constants
const float PI = 3.1415926535897932384626433832795;

float rand(vec2 co) {
    // generate a random value based on the seconds in the day that have
    // passed when loading the shader
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (u_date.z * 3674.2));
}

bool values_match(float v1, float v2, float tolerance) {
    return v1 < v2 + tolerance && v1 > v2 - tolerance;
}

bool vectors_match(vec2 v1, vec2 v2, float tolerance) {
    return v1.x < v2.x + tolerance && v1.x > v2.x - tolerance &&
                v1.y < v2.y + tolerance && v1.y > v2.y - tolerance;
}

int arr2d_index(int row, int col, int colsize) {
    return (colsize * row) + col;
}

void main() {
    // constants for generating grid
    const float MAX_LEN = 0.1;
    const float MIN_LEN = 0.08;
    const int N_COLS = 5;

    int N_ROWS = int(floor(1.0/MAX_LEN));

    // 2D prototype
    vec2 coord = gl_FragCoord.xy/u_resolution;

    // main logic
    const float ADJUST = 0.0001;
    const float TOLERANCE = 0.004;
    float COL_WIDTH = 1.0/float(N_COLS);

    // sector corresponds to number of rows/columns in
    float h_offset = (mod(floor(coord.y*MAX_LEN*100.0),2.0)/2.0)*COL_WIDTH;
    int h_sector = int(floor(((coord.x+h_offset)+ADJUST)/COL_WIDTH));
    int v_sector = int(floor((coord.y+ADJUST)/MAX_LEN));

    float alpha = 0.0;
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    // draw verticals
    if (values_match((float(h_sector)*COL_WIDTH) + h_offset, coord.x, TOLERANCE)
            && coord.x > TOLERANCE) {
        alpha = 1.0;
    }
    // draw horizontals
    if (values_match(float(v_sector)*MAX_LEN, coord.y, TOLERANCE)
            && coord.y > TOLERANCE) {
        alpha = 1.0;
    }

    // simulate old-school display by 'fuzzing' our coordinate
    float FUZZSIZE = 0.0065;
    vec2 fuzzy_coord = vec2(coord.x - mod(coord.x, FUZZSIZE),
                            coord.y - mod(coord.y, FUZZSIZE));
    coord = fuzzy_coord;

    // shift x and y along a gradient to scroll the pattern
    float x_gradient = mod(coord.x+(u_time/100.0), 2.0);
    if (x_gradient > 1.0) {
        x_gradient = 2.0-x_gradient;
    }
    float y_gradient = mod(coord.y+(u_time/150.0), 2.0);
    if (y_gradient > 1.0) {
        y_gradient = 2.0-y_gradient;
    }
    coord = vec2(x_gradient, y_gradient);

    float waves = 6.66;
    // I do all this crazy stuff to u_time because it controls where
    // on a smooth color gradient our current location falls
    float shifted_time =
        u_time
        + sin(coord.x*PI*waves*1.33) 
        + sin(coord.y*PI*waves*2.14)
        + sin((coord.x+coord.y)*PI*waves)
        + distance(coord, vec2(0.0, 1.0))
        + (distance(coord, vec2(0.34, 0.84))*1.5)
        + (distance(coord, vec2(0.76, 0.2))*3.44)
        + (distance(coord, vec2(1.0, 0.44))*3.44);

    // I can't actually remember why I did this, but it looks better
    coord = vec2(coord.x/shifted_time, coord.y/shifted_time);

    // again, this just looks better for some reason
    alpha = 0.85 + sin(coord.x*PI*waves)/6.0 + sin(coord.y*PI*waves)/6.0;

    // blue gradient should be looped through in 2 seconds...
    float b_gradient = mod(shifted_time, 2.0);
    if (b_gradient > 1.0) {
        b_gradient = 2.0-b_gradient;
    }
    // ...while the red gradient takes 5 
    float r_shift = PI/2.0;
    float r_gradient = mod(shifted_time + r_shift, 5.0);
    if (r_gradient > 2.5) {
        r_gradient = 5.0-r_gradient;
    }
    r = r_gradient;
    b = (b_gradient/2.0) + 0.25;

    // I write the blue gradient to the green channel because
    // I like the palette it generates, easiest way to tweak
    // the palette is messing with what gets written to the
    // RGB channels
    gl_FragColor = vec4(r/2.75, b, b, alpha);
}
