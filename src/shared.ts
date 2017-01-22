export function throwError(message: string): void {
    throw new Error(message);
}

/*
Copyright (c) 2015 Martin Kolárik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
export function dedent(templateStrings: TemplateStringsArray|string, ...values: any[]) {
    let matches = [];
    let strings = typeof templateStrings === 'string' ? [ templateStrings ] : templateStrings.slice();

    // 1. Remove trailing whitespace.
    strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, '');

    // 2. Find all line breaks to determine the highest common indentation level.
    for (let i = 0; i < strings.length; i++) {
        let match;

        if (match = strings[i].match(/\n[\t ]+/g)) {
            matches.push(...match);
        }
    }

    // 3. Remove the common indentation from all strings.
    if (matches.length) {
        let size = Math.min(...matches.map(value => value.length - 1));
        let pattern = new RegExp(`\n[\t ]{${size}}`, 'g');

        for (let i = 0; i < strings.length; i++) {
            strings[i] = strings[i].replace(pattern, '\n');
        }
    }

    // 4. Remove leading whitespace.
    strings[0] = strings[0].replace(/^\r?\n/, '');

    // 5. Perform interpolation.
    let string = strings[0];

    for (let i = 0; i < values.length; i++) {
        string += values[i] + strings[i + 1];
    }

    return string;
}
