export default `
.bajs-body {
    display: block;
    width: 100%;
    background-color: #fff;
    box-sizing: border-box;
    background-position: center;
    background-repeat: no-repeat;
    border: solid 0px #fff;
}

.bajs-body * {
    box-sizing: border-box;
}

.bajs-body.bajs-body-mail-style {
    background-color: rgb(244, 246, 248) !important;
    padding: 30px 12px;
}

.bajs-body.bajs-body-mail-style .bajs-body-wrap {
    max-width: 600px;
    margin: auto;
}

.bajs-body.bajs-body-mail-style .bajs-body-wrap {
    background-color: #fff;
}

.bajs-body .bajs-block {
    padding: 0 12px;
}

.bajs-body .bajs-block-wrap {
    margin-bottom: 4px;
    padding-bottom: 4px;
}

.bajs-body .bajs-type-btn .bajs-align {
    text-align: center;
}

.bajs-body .bajs-type-photo .bajs-align {
    text-align: center;
}

.bajs-body .bajs-type-photo .bajs-align img {
    cursor: pointer;
    max-width: 100%;
}

.bajs-body .bajs-type-text .bajs-align {
    text-align: center;
}

.bajs-body .bajs-btn {
    color: #fff;
    background-color: #2f54eb;
    border-color: #2f54eb;
    min-height: 32px;
    padding: 6px 15px;
    border-radius: 4px;
    display: inline-block;
    cursor: pointer;
    word-break: break-word;
    white-space: pre-wrap;
    text-decoration: none;
    text-align: center;
    transition: 0s !important;
}

.bajs-body .bajs-btn:active {
    opacity: 0.95;
}

.bajs-body .bajs-type-text .bajs-editor {
    outline: none;
    line-height: 2;
    word-break: break-word;
}

.bajs-href {
    transition: 0s;
    color: inherit;
    text-decoration: underline;
}

.bajs-href:hover {
    color: #0071b2;
    text-decoration: none;
}

.bajs-order__wrap {
    font-size: 15px;
    color: #595959;
}

.bajs-order__title {
    font-weight: bold;
    font-size: 15px;
    color: #595959;
}

a:-webkit-any-link {
    color: -webkit-link;
    cursor: pointer;
}

`;
