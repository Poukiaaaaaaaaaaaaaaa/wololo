<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [include][1]
    -   [Parameters][2]
-   [loading][3]
    -   [Parameters][4]

## include

This function "includes" a script file. It actually doesn't directly load it, but writes a script tag to the html page, which will cause
the browser to load the script when it reaches the tag. That means that the file is read _at least_ after the end of the current script, 
so script usind and used by this function should only contain definitions, and not real script with a real effect.

### Parameters

-   `scriptFilePath` **[string][5]** the path of the file that will be loaded _on the server side_. Relative to the chesspp root dirctory (which contains main.js)

## loading

This function changes the loading message. Only effective during the loading, whichs means before p5.js calls `setup()`

### Parameters

-   `message` **[string][5]** the message that will be reaplace the innerHTML of the loading message

Returns **[boolean][6]** true if it worked

[1]: #include

[2]: #parameters

[3]: #loading

[4]: #parameters-1

[5]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[6]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean
