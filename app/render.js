import "/app/fontmetrics.js";
import * as buffers from "/app/buffers.js";

export function initialize_canvas(canvas, context, application) {
    resize_canvas(canvas, window.innerWidth, window.innerHeight);

    //
    // NOTE(adam): We need to set the font measures manually, even in css in 
    // order to get proper measurement results from "fontmetrics.js".
    //
    document.body.style.fontFamily = application.settings.font.family;
    document.body.style.fontSize = application.settings.font.size + "px";
    set_font_style(context, application.settings.font, application.settings.text);
    application.settings.text.measures = context.measureText('g');
    
    render_frame(context, application);
}


function resize_canvas(element, width = 0, height = 0) {
    element.width  = width;
    element.height = height;

    return element;
}


export async function render_frame(context, application) {
    const settings = application.settings;
    const theme = settings.colorscheme;
    const measures = settings.text.measures;

    clear_context(context, theme.background);

    //
    // NOTE(adam): Because of fontmetrics.js, I can use other properties than 
    // ".width", for it polyfills the TextMetrics object!
    //
    const current_buffer = application.buffers[application.current_buffer];

    if (!! theme.current_line) {
        draw_rect(
            context,
            theme.current_line,
            point(0, current_buffer.caret.line * measures.leading),
            point(context.canvas.width, measures.leading)
        );
    }

    for (let i = 0; i < current_buffer.lines.length; i++) {
        draw_text(context, theme.font, current_buffer.lines[i].value, point(0, i * measures.leading));
    }

    draw_caret(
        context,
        measures, 
        theme.caret,
        theme.letter_under_caret,
        buffers.get_letter_at_caret(current_buffer),
        current_buffer.caret
    );
}


function clear_context(context, color) {
    context.fillStyle = color;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}


function set_font_style(context, font, text) {
    context.textBaseline = text.baseline;
    context.font = font.style + ' ' + parseInt(font.size) + "px " + font.family;
}


function draw_rect(context, color, from, to) {
    context.fillStyle = color;
    context.fillRect(from.x, from.y, to.x, to.y);
}


function draw_text(context, color, text, origin_point = {x: 0, y: 0}) {
    context.fillStyle = color;
    context.fillText(text, origin_point.x, origin_point.y);
}


function draw_caret(context, measures, color, letter_color, letter, position = {line: 0, column: 0}) {
    const from = point(position.column * measures.width, position.line * measures.leading);
    const to = point(measures.width, measures.leading);

    draw_rect(context, color, from, to);
    draw_text(context, letter_color, letter, from);
}


function point(x, y) {
    return {x, y};
}

