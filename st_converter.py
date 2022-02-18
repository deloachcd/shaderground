#!/usr/bin/env python3
import sys
import os
import re

if not os.path.exists(sys.argv[1]):
    print(f"Usage: {os.path.basename(__file__)} <infile>")
    exit(-1)
else:
    infile_name = sys.argv[1]

# behavioral meat of the program
conversion_map = {
    "uniforms": {
        # types differ between shadertoy and glslViewer
        "iResolution": {
            "st_type": "vec3",
            "type": "vec2",
            "name": "u_resolution",
        },
        "iMouse": {"st_type": "vec4", "type": "vec2", "name": "u_mouse"},
        # types are the same
        "iFrame": {"type": "int", "name": "u_frame"},
        "iTime": {"type": "float", "name": "u_time"},
        "iDelta": {"type": "float", "name": "u_delta"},
        "iDate": {"type": "vec4", "name": "u_date"},
    }
}
vec_accessors = ["x", "y", "z", "w"]
es_header = """#ifdef GL_ES
precision mediump float;
#endif

"""


class colors:
    WARN = "\033[93m"
    ENDC = "\033[0m"


# add precompiled regex key for uniforms to speed things up
for uniform_name in conversion_map["uniforms"]:
    conversion_map["uniforms"][uniform_name]["regex"] = re.compile(
        re.escape(f"{uniform_name}") + r"\.*[a-z]*"
    )

uniforms = []
warnings = []
with open(infile_name, "r") as infile:
    # first loop - get uniforms and warnings
    #
    # NOTE: this is the most disgusting part of this script's code, it isn't this bad anywhere else
    for i, line in enumerate(infile):
        linum = i + 1
        for key in conversion_map["uniforms"]:
            uniform = conversion_map["uniforms"][key]
            uniform_instances = uniform["regex"].findall(line)
            if uniform_instances:
                # first, check for ShaderToy exclusive dimension access in uniforms, and warn if we find one
                if "st_type" in uniform.keys():
                    st_dimension = int(uniform["st_type"][-1])
                    dimension = int(uniform["type"][-1])
                    if dimension < st_dimension:
                        warn_accessors = vec_accessors[dimension:st_dimension]
                        for uniform_instance in uniform_instances:
                            dot_portion = uniform_instance.split(".")[-1]
                            for accessor in warn_accessors:
                                if accessor in dot_portion:
                                    warnings.append(
                                        f"ShaderToy exclusive dimension ({accessor}) in uniform reference, line {linum}"
                                    )
                if key not in uniforms:
                    uniforms.append(key)

    sys.stdout.write(es_header)
    for key in uniforms:
        uniform = conversion_map["uniforms"][key]
        sys.stdout.write(f"uniform {uniform['type']} {uniform['name']};\n")
    sys.stdout.write("\n")

    main_declaration_re = re.compile(
        f"^void [a-zA-Z]+\(\s*out\s*vec4\s*(?P<fragColor>[a-zA-Z]+)\s*,\s*in\s*vec2\s*(?P<fragCoord>[a-zA-Z]+)\s*"
    )
    infile.seek(0)
    check_brace = False
    fragColor_v = fragCoord_v = None
    for i, line in enumerate(infile):
        # right after we find mainImage(), ensure we skip double writing opening brace if it's on the next line
        if check_brace and re.match("^\{", line):
            check_brace = False
            continue

        # check if line is main() declaration
        main_decl_match = main_declaration_re.match(line)
        if main_decl_match:
            fragColor_v = main_decl_match.group("fragColor")
            fragCoord_v = main_decl_match.group("fragCoord")
            line = "void main() {\n"
            check_brace = True

        # convert gl params to their explicit versions
        if fragColor_v and fragColor_v in line:
            line = line.replace(fragColor_v, "gl_FragColor")
        if fragCoord_v and fragCoord_v in line:
            line = line.replace(fragCoord_v, "gl_FragCoord")

        # check for uniforms in line, replace if found
        for key in uniforms:
            if key in line:
                uniform = conversion_map["uniforms"][key]
                line = line.replace(key, uniform["name"])

        # finally, write the line to stdout
        sys.stdout.write(line)


for warning in warnings:
    sys.stderr.write(f"[{colors.WARN}WARN{colors.ENDC}] {warning}\n")
# print(uniforms)
