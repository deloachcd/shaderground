#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_date;


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

void main() {
    // constants for generating grid
    const float MAX_LEN = 0.1;
    const float MIN_LEN = 0.08;
    const int N_COLS = 5;

    // 2D prototype
    vec2 coord = gl_FragCoord.xy/u_resolution;

    // main logic
    const float ADJUST = 0.0001;
    const float TOLERANCE = 0.001;
    float COL_WIDTH = 1.0/float(N_COLS);

    // sector corresponds to number of rows/columns in
    int horizontal_sector = int(floor((coord.x+ADJUST)/COL_WIDTH));
    int vertical_sector = int(floor((coord.y+ADJUST)/MAX_LEN));
    float horizontal_offset = (mod(floor(coord.y*MAX_LEN*100),2)/2.0)*COL_WIDTH;

    float alpha = 0.0;
    float r = 0.0;
    float g = 0.0;
    // draw verticals
    if (values_match((horizontal_sector*COL_WIDTH) + horizontal_offset,
                     coord.x, TOLERANCE)) {
        alpha = 1.0;
    }
    // draw horizontals
    if (values_match(vertical_sector*MAX_LEN, coord.y, TOLERANCE)) {
        alpha = 1.0;
    }
    // draw verticals
    if ((values_match((floor((coord.x+ADJUST)/COL_WIDTH)*COL_WIDTH) + horizontal_offset,
                      coord.x, TOLERANCE) &&
         values_match((floor((coord.y+ADJUST)/MAX_LEN)*MAX_LEN),
                      coord.y, TOLERANCE))) {
        g = 0.0;
    }

    int N_ROWS = int(floor(1.0/MAX_LEN));
    float placeholder;
    int i, j;
    float x, y;
    for (i=0; i<=N_ROWS; i++) {
        y = float(i) * MAX_LEN;
        if (horizontal_offset != 0.0) {
            if (vectors_match(coord, vec2(0.0, y), TOLERANCE*10)) {
                g = 1.0;
            }
            if (vectors_match(coord, vec2(1.0, y), TOLERANCE*10)) {
                g = 1.0;
            }
        }
        for (j=0; j<=N_COLS; j++) {
            x = (j*COL_WIDTH) + horizontal_offset;
            if (vectors_match(coord, vec2(x, y), TOLERANCE*10)) {
                g = 1.0;
            }
        }
    }

    r = rand(coord);

    //gl_FragColor = vec4(r, g, 0.0, 1.0);
    gl_FragColor = vec4(r, g, 0.0, alpha);
}
