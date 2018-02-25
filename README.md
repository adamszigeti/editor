# Editor

A canvas-based HTML 5 editor. This project is the Nth iteration on my ever-returning desire to write a usable text editor in the browser. After many DOM-based implementation, I have decided to use HTML's canvas element for rendering purposes this time, which led to significantly faster implementation time (in summary, about an afternoon), and much better performance. Ultimately, this code is meant to be thrown away, it's sole purpose is to gain me experience; so obviously **it's not ready for production use!**

Currently the target runtime environment is Google's V8 engine, it's not tested in anything else (expected failure points are keyboard input processing, and incorrect text metrics due to browser API differences). As a result of this decision, a hyphotetical Electron-based implementation would require as minimal effort as humanly possible.

## Working features

1. Drawing text to the canvas.
2. Configurable settings:
    * Font
        * Family (currently needs to be monospaced for correct caret size)
        * Size
        * Style (italic, bold, normal, etc.)
    * Colorscheme
        * Background color
        * Foreground color
        * Caret color
        * Current line highlight color
        * "Letter under caret"-color
    * Text
        * Indentation size in spaces
        * Drawing baseline ("top" by default, currently should be treated as constant)
        * Measures (later this will be used as an internal configuration, and will be exposed as a caret-related setting)
3. Measuring text metrics and using a block cursor
4. Inserting visible characters and spaces.
    * Inserting at the end of the line
    * Inserting at a specific postion in a line
5. Move between characters with `ArrowUp` and `ArrowRight`. It's intentional to not to wrap at the end of the line.
6. Move between lines with `ArrowUp` and `ArrowDown`.
    * It will remember the rightmost column the caret was in, and if it's available in the moved line, it will jump to that column.
    * If the line has fewer characters, the caret will jump to the end of line.
7. `Home` jumps to the beginning of the current line.
8. `End` jumps to the end of the current line.
9. `Enter` inserts a new empty line if pressed at the end of the line.
    * If there are characters after the place the `Enter` was pressed, it will move the rest of the characters to the newly created line.
    * `Enter` also respects the indentation level of the previous line, and inserts the same amount of spaces automatically.
10. `Backspace` deletes a character to the left.
    * It will treat a tabstop as a single character.
    * If pressed at the beginning of the line, it will join the previous line and the current line's contents.
    * Lingering whitespaces will be erased back to the closest tabstop *(for example: using 4 spaces as tab representation, if the caret is at the 7th column, one `Backspace` will delete 2 spaces to get to the closest tabstop; namely, 4. If there are 7 spaces at the beginning of the line, it will delete 3 spaces back - given that the caret is at the 8th column)*
11. `Delete` will delete the next character.
    * Lingering spaces will be erased up until the next tabstop.
    * It will treat one tabstop as a single character.
12. Jump to previous/previous empty line with `Ctrl-ArrowUp` and `Ctrl+ArrowDown`
