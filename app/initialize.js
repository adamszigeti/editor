import * as buffers from "/app/buffers.js";
import {initialize_canvas, render_frame} from "/app/render.js";

(function () {
    const canvas = document.querySelector("canvas");

    const context = canvas.getContext('2d');
    const application = {
        settings: {
            font: {
                size: 14,
                style: "normal",
                family: "Liberation Mono",
            },
            colorscheme: {
                font: "#000000",
                caret: "#000000",
                background: "#ffffff",
                current_line: "#f0f0f0",
                letter_under_caret: "#ffffff",
            },
            text: {
                indent_size: 4,
                baseline: "top",
                measures: context.measureText('g'),
            }
        },

        current_buffer: 0,
        buffers: [
            {
                caret: {
                    line: 0,
                    column: 0,
                    target_column_position: 0
                },
                path: "/fake/path/of/the/file.demo",
                lines: [
                    {
                        indent_level: 0,
                        value: "package main",
                    },
                    {
                        indent_level: 0,
                        value: "",
                    },
                    {
                        indent_level: 0,
                        value: "import \"fmt\"",
                    },
                    {
                        indent_level: 0,
                        value: "",
                    },
                    {
                        indent_level: 0,
                        value: "func main() {",
                    },
                    {
                        indent_level: 1,
                        value: "    fmt.Println(\"Greetings, World!\")",
                    },
                    {
                        indent_level: 0,
                        value: "}",
                    }
                ],
            },
        ],
    };

    initialize_canvas(canvas, context, application);
    render_frame(context, application);

    window.onresize = ({target}) => {
        initialize_canvas(canvas, context, application);
    };

    const indent_detector_regex = /\S|$/;
    window.onkeydown = async function (event) {
        const buffer = application.buffers[application.current_buffer];
        const caret = buffer.caret;
        const settings = application.settings;
        const indent_level = buffer.lines[caret.line].indent_level;
        const spaces_till_first_char = buffer.lines[caret.line].value.search(indent_detector_regex);
        let chars_to_delete = 0;

        switch (event.key) {
            case "ArrowUp":
                buffers.move_caret_vertically(buffer, -1);
                break;

            case "ArrowDown":
                buffers.move_caret_vertically(buffer, 1);
                break;

            case "ArrowLeft":
                buffers.move_caret_horizontally(buffer, -1);
                break;

            case "ArrowRight":
                buffers.move_caret_horizontally(buffer, 1);
                break;

            case "Home":
                buffers.move_caret_horizontally(buffer, -1 * caret.column);
                break;

            case "End":
                buffers.move_caret_horizontally(buffer, buffer.lines[buffer.caret.line].value.length - caret.column);
                break;

            case "Alt":
            case "Shift":
            case "Control":
                return;

            case "Escape":
            case "CapsLock":
                return;

            case "Tab":
                let chars_to_insert = settings.text.indent_size;
                if (0 < indent_level && caret.column <= spaces_till_first_char) {
                    let remainder = caret.column % settings.text.indent_size;
                    chars_to_insert = settings.text.indent_size - remainder;
                }

                const indentation = ' '.repeat(chars_to_insert);
                buffer.lines[caret.line].indent_level += 1;
                buffers.insert_at_caret(buffer, indentation);
                break;

            case "Enter":
                buffers.append_line(buffer);
                if (0 < indent_level) {
                    const characters = settings.text.indent_size * indent_level;
                    const indent = ' '.repeat(characters);

                    buffer.lines[buffer.caret.line].value = indent + buffer.lines[buffer.caret.line].value;
                    buffer.lines[buffer.caret.line].indent_level = indent_level;
                    buffers.move_caret_horizontally(buffer, characters);
                }
                break;

            case "Delete":
                chars_to_delete = 1;
                if (0 < indent_level && caret.column <= spaces_till_first_char) {
                    let remainder = caret.column % settings.text.indent_size;
                    chars_to_delete = settings.text.indent_size - remainder;
                }
                
                buffers.delete_char(buffer, chars_to_delete);
                break;

            case "Backspace":
                if (0 === caret.column && 0 < caret.line) {
                    buffers.remove_current_line(buffer);
                    break;
                }

                chars_to_delete = -1;
                if (0 < indent_level && caret.column <= spaces_till_first_char) {
                    let remainder = caret.column % settings.text.indent_size;
                    chars_to_delete = -1 * (remainder || settings.text.indent_size);
                    buffer.lines[caret.line].indent_level -= 1;
                }

                buffers.delete_char(buffer, chars_to_delete);
                break;

            default:
                if ('p' === event.key && true === event.ctrlKey) {
                    console.log("Ctrl+P!");
                    break;
                }
                else if (1 === event.key.length) {
                    buffers.insert_at_caret(buffer, event.key);
                }
                break;
        }

        event.preventDefault();
        render_frame(context, application);
    };
})()

