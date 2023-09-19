(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.xlsxUtils = {}));
})(this, (function (exports) { 'use strict';

    console.log('run ts');
    function a() {
        return { a: '1' };
    }

    exports.a = a;

}));
