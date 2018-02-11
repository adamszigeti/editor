// file: app/buffers.js

export function append_line(buffer) {
    const caret = buffer.caret;
    const lines = buffer.lines;
    let line = buffer.lines[caret.line].value
    const new_line = line.slice(caret.column);
    line = line.slice(0, caret.column)
    buffer.lines[caret.line].value = line;

    const next_line = caret.line + 1;
    buffer.lines = [...lines.slice(0, next_line), {value: new_line}, ...lines.slice(next_line)];
    move_caret_vertically(buffer, 1);
    move_caret_horizontally(buffer, -1 * caret.column);
}


export function remove_current_line(buffer) {
    const caret = buffer.caret;
    const lines = buffer.lines;
    const line = lines[caret.line].value;
    move_caret_vertically(buffer, -1);
    move_caret_horizontally(buffer, lines[caret.line].value.length);
    lines[caret.line].value += line;

    buffer.lines = [...lines.slice(0, caret.line + 1), ...lines.slice(caret.line + 2)];
}


export function insert_at_caret(buffer, subject = '') {
    const caret = buffer.caret;
    let line = buffer.lines[caret.line].value;
    line = line.slice(0, caret.column) + subject + line.slice(caret.column);
    buffer.lines[caret.line].value = line;
    move_caret_horizontally(buffer, subject.length);
}


export function delete_char(buffer, direction = -1) {
    const caret = buffer.caret;
    let line = buffer.lines[caret.line].value;

    if (direction < 0) {
        line = line.slice(0, caret.column - 1) + line.slice(caret.column);
        move_caret_horizontally(buffer, direction);
    }
    else {
        line = line.slice(0, caret.column) + line.slice(caret.column + 1);
    }

    buffer.lines[caret.line].value = line;
}


export function move_caret_vertically(buffer, direction_vector = 1) {
    let current_line = buffer.lines[buffer.caret.line];

    const computed = buffer.caret.line + direction_vector;
    if (computed < 0 || buffer.lines.length <= computed) {
        return;
    }

    buffer.caret.line = computed;
    current_line = buffer.lines[computed];
    buffer.caret.column = buffer.caret.target_column_position;
    if (current_line.value.length <= buffer.caret.column) {
        buffer.caret.column = current_line.value.length;
    }
}


export function move_caret_horizontally(buffer, direction_vector = 1) {
    const computed = buffer.caret.column + direction_vector;
    const current_line = buffer.lines[buffer.caret.line];

    if (-1 < computed && computed <= current_line.value.length) {
        buffer.caret.column = computed;
        buffer.caret.target_column_position = computed;
    }
}


export function get_letter_at_caret(buffer) {
    const current_line = buffer.lines[buffer.caret.line] || {value: ''};
    return current_line.value[buffer.caret.column] || '';
}

