#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  u_light;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec4  u_date;

#ifdef HOLOPLAY
uniform vec4    u_holoPlayViewport;
#define RESOLUTION u_holoPlayViewport.zw
#else
#define RESOLUTION u_resolution
#endif

varying vec4 v_position;

#ifdef MODEL_VERTEX_COLOR
varying vec4    v_color;
#endif

#ifdef MODEL_VERTEX_NORMAL
varying vec3    v_normal;
#endif

#ifdef MODEL_VERTEX_TEXCOORD
varying vec2    v_texcoord;
#endif

float get_pixel_height (float pyramid_height, float pyramid_width, vec2 coord) {
    float diagonal = pyramid_height/(2*pyramid_width);
    float sector_x = mod(coord.x, pyramid_width);
    float sector_y = mod(coord.y, pyramid_height);
    float height = 0.0;

    // bottom fourth
    if (sector_y < pyramid_height/4) {
        // left side
        if (sector_x < pyramid_width/2) {
            if (sector_y < diagonal*sector_x) {
                height = sector_y / (pyramid_height/4);
            } else {
                height = sector_x / (pyramid_width/2);
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2));
            if (sector_y < (diagonal*adjusted_x*-1)+(pyramid_height/4)) {
                height = sector_y / (pyramid_height/4);
            } else {
                height = ((adjusted_x*-1)/(pyramid_width/2)) + 1.0;
            }
        }
    // middle section
    } else if ((sector_y > pyramid_height/4) && sector_y < 3*pyramid_height/4) {
        //height = 0.75;
        if (sector_x < pyramid_width/2) {
            height = sector_x / (pyramid_width/2);
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2));
            height = ((adjusted_x*-1)/(pyramid_width/2)) + 1.0;
        }
    // top fourth
    } else {
        // left side
        if (sector_x < pyramid_width/2) {
            if (sector_y > (diagonal*sector_x*-1) + pyramid_height) {
                float adjusted_y = (sector_y-(3*pyramid_height/4));
                height = ((adjusted_y*-1)/(pyramid_height/4)) + 1.0;
            } else {
                height = sector_x / (pyramid_width/2);
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2));
            if (sector_y > (diagonal*adjusted_x)+(3*pyramid_height/4)) {
                float adjusted_y = (sector_y-(3*pyramid_height/4));
                height = ((adjusted_y*-1)/(pyramid_height/4)) + 1.0;
            } else {
                height = ((adjusted_x*-1)/(pyramid_width/2)) + 1.0;
            }
        }
    }
    return height;
}

vec2 ratio(in vec2 st, in vec2 s) {
    return mix( vec2((st.x*s.x/s.y)-(s.x*.5-s.y*.5)/s.y,st.y),
                vec2(st.x,st.y*(s.y/s.x)-(s.y*.5-s.x*.5)/s.x),
                step(s.x,s.y));
}

float stroke(float x, float size, float w) {
    float d = step(size, x + w * 0.5) - step(size, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

void main(void) {
   vec3 color = vec3(0.0);

   vec2 st = gl_FragCoord.xy/RESOLUTION;
   vec2 vcoord = v_position.xz/RESOLUTION;
   float aspect = 594.0/904.0;

#ifdef BACKGROUND
    color = vec3(1.0);
#else
    #ifdef MODEL_VERTEX_COLOR
    color *= v_color.rgb;
    #endif

    vec3 adjusted_position = vec3(v_position.x+0.75, v_position.y, v_position.z+0.5);
    vec3 n = normalize(v_normal);
    vec3 p = normalize(adjusted_position);
    vec3 l = normalize(u_light);

    if (n == vec3(0.0, 1.0, 0.0)) {
        // on top plane
        vec2 plane_position = v_position.zx;
        // I lifted these values straight from the OBJ mesh data, don't know if
        // there's a 'cleaner' way to do this but hey, it works.
        plane_position.x += 6.053;
        plane_position.y += 6.1318;
        plane_position.x /= 6.053 + 6.051;
        plane_position.y /= 6.13 + 6.002;
        color.x += plane_position.x;
        color.y += plane_position.y;
    }
    float diffuse = (dot(n, l) + 1.0) * 0.5;
    //color *= diffuse;
#endif

    gl_FragColor = vec4(color, 1.0);
}
