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

    window.onkeydown = async function (event) {
        const buffer = application.buffers[application.current_buffer];
        const caret = buffer.caret;
        const settings = application.settings;
        const indent_level = buffer.lines[caret.line].indent_level;

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
                const indentation = ' '.repeat(settings.text.indent_size);
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
                buffers.delete_char(buffer, 1);
                break;

            case "Backspace":
                if (0 === caret.column && 0 < caret.line) {
                    buffers.remove_current_line(buffer);
                    break;
                }
                buffers.delete_char(buffer, -1);
                break;

            case "F1":
            case "F2":
            case "F3":
            case "F4":
            case "F5":
            case "F6":
            case "F7":
            case "F8":
            case "F9":
            case "F10":
            case "F11":
            case "F12":
                return;

            default:
                if ('p' === event.key && true === event.ctrlKey) {
                    console.log("Ctrl+P!");
                    break;
                }
                buffers.insert_at_caret(buffer, event.key);
                break;
        }

        event.preventDefault();
        render_frame(context, application);
    };
})()

