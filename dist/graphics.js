var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.global.CLOSURE_UNCOMPILED_DEFINES;
goog.global.CLOSURE_DEFINES;
goog.isDef = function(val) {
  return val !== void 0;
};
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0]);
  }
  for (var part;parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object;
    } else {
      if (cur[part]) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
    }
  }
};
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_UNCOMPILED_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
      value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
    } else {
      if (goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, name)) {
        value = goog.global.CLOSURE_DEFINES[name];
      }
    }
  }
  goog.exportPath_(name, value);
};
goog.define("goog.DEBUG", true);
goog.define("goog.LOCALE", "en");
goog.define("goog.TRUSTED_SITE", true);
goog.define("goog.STRICT_MODE_COMPATIBLE", false);
goog.define("goog.DISALLOW_TEST_ONLY_CODE", COMPILED && !goog.DEBUG);
goog.define("goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING", false);
goog.provide = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
  }
  goog.constructNamespace_(name);
};
goog.constructNamespace_ = function(name, opt_obj) {
  if (!COMPILED) {
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while (namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }
  goog.exportPath_(name, opt_obj);
};
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;
goog.module = function(name) {
  if (!goog.isString(name) || !name || name.search(goog.VALID_MODULE_RE_) == -1) {
    throw Error("Invalid module identifier");
  }
  if (!goog.isInModuleLoader_()) {
    throw Error("Module " + name + " has been loaded incorrectly.");
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error("goog.module may only be called once per module.");
  }
  goog.moduleLoaderState_.moduleName = name;
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
  }
};
goog.module.get = function(name) {
  return goog.module.getInternal_(name);
};
goog.module.getInternal_ = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return name in goog.loadedModules_ ? goog.loadedModules_[name] : goog.getObjectByName(name);
    } else {
      return null;
    }
  }
};
goog.moduleLoaderState_ = null;
goog.isInModuleLoader_ = function() {
  return goog.moduleLoaderState_ != null;
};
goog.module.declareLegacyNamespace = function() {
  if (!COMPILED && !goog.isInModuleLoader_()) {
    throw new Error("goog.module.declareLegacyNamespace must be called from " + "within a goog.module");
  }
  if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
    throw Error("goog.module must be called prior to " + "goog.module.declareLegacyNamespace.");
  }
  goog.moduleLoaderState_.declareLegacyNamespace = true;
};
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + (opt_message ? ": " + opt_message : "."));
  }
};
goog.forwardDeclare = function(name) {
};
goog.forwardDeclare("Document");
goog.forwardDeclare("HTMLScriptElement");
goog.forwardDeclare("XMLHttpRequest");
if (!COMPILED) {
  goog.isProvided_ = function(name) {
    return name in goog.loadedModules_ || !goog.implicitNamespaces_[name] && goog.isDefAndNotNull(goog.getObjectByName(name));
  };
  goog.implicitNamespaces_ = {"goog.module":true};
}
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for (var part;part = parts.shift();) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};
goog.addDependency = function(relPath, provides, requires, opt_isModule) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for (var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      deps.pathIsModule[path] = !!opt_isModule;
    }
    for (var j = 0;require = requires[j];j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};
goog.define("goog.ENABLE_DEBUG_LOADER", true);
goog.logToConsole_ = function(msg) {
  if (goog.global.console) {
    goog.global.console["error"](msg);
  }
};
goog.require = function(name) {
  if (!COMPILED) {
    if (goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_) {
      goog.maybeProcessDeferredDep_(name);
    }
    if (goog.isProvided_(name)) {
      if (goog.isInModuleLoader_()) {
        return goog.module.getInternal_(name);
      } else {
        return null;
      }
    }
    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.writeScripts_(path);
        return null;
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    goog.logToConsole_(errorMessage);
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};
goog.instantiatedSingletons_ = [];
goog.define("goog.LOAD_MODULE_USING_EVAL", true);
goog.define("goog.SEAL_MODULE_EXPORTS", goog.DEBUG);
goog.loadedModules_ = {};
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
if (goog.DEPENDENCIES_ENABLED) {
  goog.dependencies_ = {pathIsModule:{}, nameToPath:{}, requires:{}, visited:{}, written:{}, deferred:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return doc != null && "write" in doc;
  };
  goog.findBasePath_ = function() {
    if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else {
      if (!goog.inHtmlDocument_()) {
        return;
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("SCRIPT");
    for (var i = scripts.length - 1;i >= 0;--i) {
      var script = (scripts[i]);
      var src = script.src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };
  goog.importScript_ = function(src, opt_sourceText) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if (importScript(src, opt_sourceText)) {
      goog.dependencies_.written[src] = true;
    }
  };
  goog.IS_OLD_IE_ = !!(!goog.global.atob && goog.global.document && goog.global.document.all);
  goog.importModule_ = function(src) {
    var bootstrap = 'goog.retrieveAndExecModule_("' + src + '");';
    if (goog.importScript_("", bootstrap)) {
      goog.dependencies_.written[src] = true;
    }
  };
  goog.queuedModules_ = [];
  goog.wrapModule_ = function(srcUrl, scriptText) {
    if (!goog.LOAD_MODULE_USING_EVAL || !goog.isDef(goog.global.JSON)) {
      return "" + "goog.loadModule(function(exports) {" + '"use strict";' + scriptText + "\n" + ";return exports" + "});" + "\n//# sourceURL=" + srcUrl + "\n";
    } else {
      return "" + "goog.loadModule(" + goog.global.JSON.stringify(scriptText + "\n//# sourceURL=" + srcUrl + "\n") + ");";
    }
  };
  goog.loadQueuedModules_ = function() {
    var count = goog.queuedModules_.length;
    if (count > 0) {
      var queue = goog.queuedModules_;
      goog.queuedModules_ = [];
      for (var i = 0;i < count;i++) {
        var path = queue[i];
        goog.maybeProcessDeferredPath_(path);
      }
    }
  };
  goog.maybeProcessDeferredDep_ = function(name) {
    if (goog.isDeferredModule_(name) && goog.allDepsAreAvailable_(name)) {
      var path = goog.getPathFromDeps_(name);
      goog.maybeProcessDeferredPath_(goog.basePath + path);
    }
  };
  goog.isDeferredModule_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && goog.dependencies_.pathIsModule[path]) {
      var abspath = goog.basePath + path;
      return abspath in goog.dependencies_.deferred;
    }
    return false;
  };
  goog.allDepsAreAvailable_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && path in goog.dependencies_.requires) {
      for (var requireName in goog.dependencies_.requires[path]) {
        if (!goog.isProvided_(requireName) && !goog.isDeferredModule_(requireName)) {
          return false;
        }
      }
    }
    return true;
  };
  goog.maybeProcessDeferredPath_ = function(abspath) {
    if (abspath in goog.dependencies_.deferred) {
      var src = goog.dependencies_.deferred[abspath];
      delete goog.dependencies_.deferred[abspath];
      goog.globalEval(src);
    }
  };
  goog.loadModuleFromUrl = function(url) {
    goog.retrieveAndExecModule_(url);
  };
  goog.loadModule = function(moduleDef) {
    var previousState = goog.moduleLoaderState_;
    try {
      goog.moduleLoaderState_ = {moduleName:undefined, declareLegacyNamespace:false};
      var exports;
      if (goog.isFunction(moduleDef)) {
        exports = moduleDef.call(goog.global, {});
      } else {
        if (goog.isString(moduleDef)) {
          exports = goog.loadModuleFromSource_.call(goog.global, moduleDef);
        } else {
          throw Error("Invalid module definition");
        }
      }
      var moduleName = goog.moduleLoaderState_.moduleName;
      if (!goog.isString(moduleName) || !moduleName) {
        throw Error('Invalid module name "' + moduleName + '"');
      }
      if (goog.moduleLoaderState_.declareLegacyNamespace) {
        goog.constructNamespace_(moduleName, exports);
      } else {
        if (goog.SEAL_MODULE_EXPORTS && Object.seal) {
          Object.seal(exports);
        }
      }
      goog.loadedModules_[moduleName] = exports;
    } finally {
      goog.moduleLoaderState_ = previousState;
    }
  };
  goog.loadModuleFromSource_ = function() {
    var exports = {};
    eval(arguments[0]);
    return exports;
  };
  goog.writeScriptSrcNode_ = function(src) {
    goog.global.document.write('<script type="text/javascript" src="' + src + '"></' + "script>");
  };
  goog.appendScriptSrcNode_ = function(src) {
    var doc = goog.global.document;
    var scriptEl = (doc.createElement("script"));
    scriptEl.type = "text/javascript";
    scriptEl.src = src;
    scriptEl.defer = false;
    scriptEl.async = false;
    doc.head.appendChild(scriptEl);
  };
  goog.writeScriptTag_ = function(src, opt_sourceText) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING && doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      var isOldIE = goog.IS_OLD_IE_;
      if (opt_sourceText === undefined) {
        if (!isOldIE) {
          if (goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING) {
            goog.appendScriptSrcNode_(src);
          } else {
            goog.writeScriptSrcNode_(src);
          }
        } else {
          var state = " onreadystatechange='goog.onScriptLoad_(this, " + ++goog.lastNonModuleScriptIndex_ + ")' ";
          doc.write('<script type="text/javascript" src="' + src + '"' + state + "></" + "script>");
        }
      } else {
        doc.write('<script type="text/javascript">' + opt_sourceText + "</" + "script>");
      }
      return true;
    } else {
      return false;
    }
  };
  goog.lastNonModuleScriptIndex_ = 0;
  goog.onScriptLoad_ = function(script, scriptIndex) {
    if (script.readyState == "complete" && goog.lastNonModuleScriptIndex_ == scriptIndex) {
      goog.loadQueuedModules_();
    }
    return true;
  };
  goog.writeScripts_ = function(pathToLoad) {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }
      if (path in deps.visited) {
        return;
      }
      deps.visited[path] = true;
      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }
    visitNode(pathToLoad);
    for (var i = 0;i < scripts.length;i++) {
      var path = scripts[i];
      goog.dependencies_.written[path] = true;
    }
    var moduleState = goog.moduleLoaderState_;
    goog.moduleLoaderState_ = null;
    for (var i = 0;i < scripts.length;i++) {
      var path = scripts[i];
      if (path) {
        if (!deps.pathIsModule[path]) {
          goog.importScript_(goog.basePath + path);
        } else {
          goog.importModule_(goog.basePath + path);
        }
      } else {
        goog.moduleLoaderState_ = moduleState;
        throw Error("Undefined script input");
      }
    }
    goog.moduleLoaderState_ = moduleState;
  };
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };
  goog.findBasePath_();
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js");
  }
}
goog.normalizePath_ = function(path) {
  var components = path.split("/");
  var i = 0;
  while (i < components.length) {
    if (components[i] == ".") {
      components.splice(i, 1);
    } else {
      if (i && components[i] == ".." && components[i - 1] && components[i - 1] != "..") {
        components.splice(--i, 2);
      } else {
        i++;
      }
    }
  }
  return components.join("/");
};
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  } else {
    var xhr = new goog.global["XMLHttpRequest"];
    xhr.open("get", src, false);
    xhr.send();
    return xhr.responseText;
  }
};
goog.retrieveAndExecModule_ = function(src) {
  if (!COMPILED) {
    var originalPath = src;
    src = goog.normalizePath_(src);
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    var scriptText = goog.loadFileSync_(src);
    if (scriptText != null) {
      var execModuleScript = goog.wrapModule_(src, scriptText);
      var isOldIE = goog.IS_OLD_IE_;
      if (isOldIE) {
        goog.dependencies_.deferred[originalPath] = execModuleScript;
        goog.queuedModules_.push(originalPath);
      } else {
        importScript(src, execModuleScript);
      }
    } else {
      throw new Error("load of " + src + "failed");
    }
  }
};
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == "object") {
    if (value) {
      if (value instanceof Array) {
        return "array";
      } else {
        if (value instanceof Object) {
          return s;
        }
      }
      var className = Object.prototype.toString.call((value));
      if (className == "[object Window]") {
        return "object";
      }
      if (className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return "array";
      }
      if (className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return "function";
      }
    } else {
      return "null";
    }
  } else {
    if (s == "function" && typeof value.call == "undefined") {
      return "object";
    }
  }
  return s;
};
goog.isNull = function(val) {
  return val === null;
};
goog.isDefAndNotNull = function(val) {
  return val != null;
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array";
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number";
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function";
};
goog.isString = function(val) {
  return typeof val == "string";
};
goog.isBoolean = function(val) {
  return typeof val == "boolean";
};
goog.isNumber = function(val) {
  return typeof val == "number";
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function";
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function";
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};
goog.removeUid = function(obj) {
  if (obj !== null && "removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == "object" || type == "array") {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == "array" ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return (fn.call.apply(fn.bind, arguments));
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error;
  }
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if (Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return +new Date;
};
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, "JavaScript");
  } else {
    if (goog.global.eval) {
      if (goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _evalTest_ = 1;");
        if (typeof goog.global["_evalTest_"] != "undefined") {
          try {
            delete goog.global["_evalTest_"];
          } catch (ignore) {
          }
          goog.evalWorksForGlobals_ = true;
        } else {
          goog.evalWorksForGlobals_ = false;
        }
      }
      if (goog.evalWorksForGlobals_) {
        goog.global.eval(script);
      } else {
        var doc = goog.global.document;
        var scriptElt = (doc.createElement("SCRIPT"));
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt);
      }
    } else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for (var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join("-");
  };
  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }
  if (opt_modifier) {
    return className + "-" + rename(opt_modifier);
  } else {
    return rename(className);
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}
goog.getMsg = function(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
      return opt_values != null && key in opt_values ? opt_values[key] : match;
    });
  }
  return str;
};
goog.getMsgWithFallback = function(a, b) {
  return a;
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
  childCtor.base = function(me, methodName, var_args) {
    var args = new Array(arguments.length - 2);
    for (var i = 2;i < arguments.length;i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !caller) {
    throw Error("arguments.caller not defined.  goog.base() cannot be used " + "with strict mode code. See " + "http://www.ecma-international.org/ecma-262/5.1/#sec-C");
  }
  if (caller.superClass_) {
    var ctorArgs = new Array(arguments.length - 1);
    for (var i = 1;i < arguments.length;i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }
  var args = new Array(arguments.length - 2);
  for (var i = 2;i < arguments.length;i++) {
    args[i - 2] = arguments[i];
  }
  var foundCaller = false;
  for (var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else {
      if (foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args);
      }
    }
  }
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global);
};
if (!COMPILED) {
  goog.global["COMPILED"] = COMPILED;
}
goog.defineClass = function(superClass, def) {
  var constructor = def.constructor;
  var statics = def.statics;
  if (!constructor || constructor == Object.prototype.constructor) {
    constructor = function() {
      throw Error("cannot instantiate an interface (no constructor defined).");
    };
  }
  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  if (superClass) {
    goog.inherits(cls, superClass);
  }
  delete def.constructor;
  delete def.statics;
  goog.defineClass.applyProperties_(cls.prototype, def);
  if (statics != null) {
    if (statics instanceof Function) {
      statics(cls);
    } else {
      goog.defineClass.applyProperties_(cls, statics);
    }
  }
  return cls;
};
goog.defineClass.ClassDescriptor;
goog.define("goog.defineClass.SEAL_CLASS_INSTANCES", goog.DEBUG);
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (goog.defineClass.SEAL_CLASS_INSTANCES && Object.seal instanceof Function) {
    if (superClass && superClass.prototype && superClass.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
      return ctr;
    }
    var wrappedCtr = function() {
      var instance = ctr.apply(this, arguments) || this;
      instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];
      if (this.constructor === wrappedCtr) {
        Object.seal(instance);
      }
      return instance;
    };
    return wrappedCtr;
  }
  return ctr;
};
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.defineClass.applyProperties_ = function(target, source) {
  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
  for (var i = 0;i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length;i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
};
goog.tagUnsealableClass = function(ctr) {
  if (!COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES) {
    ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
  }
};
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";
goog.provide("acgraph.utils.IdGenerator");
acgraph.utils.IdGenerator = function() {
};
goog.addSingletonGetter(acgraph.utils.IdGenerator);
acgraph.utils.IdGenerator.ElementTypePrefix = {STAGE:"stage", FILL:"fill", FILL_PATTERN:"fillPattern", HATCH_FILL:"hatchFill", IMAGE_FILL:"imageFill", STROKE:"stroke", LAYER:"layer", UNMANAGEABLE_LAYER:"unmanageablelayer", RECT:"rect", CIRCLE:"circle", ELLIPSE:"ellipse", PATH:"path", GRADIENT_KEY:"gKey", LINEAR_GRADIENT:"linearGradient", RADIAL_GRADIENT:"radialGradient", TEXT:"text", TEXT_SEGMENT:"tSegment", IMAGE:"image", CLIP:"clip", SHAPE_TYPE:"shapeType"};
acgraph.utils.IdGenerator.prototype.nextId_ = 0;
acgraph.utils.IdGenerator.prototype.prefix_ = "#ac";
acgraph.utils.IdGenerator.prototype.uid_property_ = "ac_uid_" + (Math.random() * 1E9 >>> 0);
acgraph.utils.IdGenerator.prototype.identify = function(obj, opt_prefix) {
  return obj[this.uid_property_] || (obj[this.uid_property_] = this.generateId(obj, opt_prefix));
};
acgraph.utils.IdGenerator.prototype.generateId = function(obj, opt_prefix) {
  var typePrefix = goog.isDef(opt_prefix) ? opt_prefix : obj.getElementTypePrefix ? obj.getElementTypePrefix() : "";
  return [this.prefix_, typePrefix, (this.nextId_++).toString(36)].join("_");
};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    var stack = (new Error).stack;
    if (stack) {
      this.stack = stack;
    }
  }
  if (opt_msg) {
    this.message = String(opt_msg);
  }
  this.reportErrorToServer = true;
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.dom.NodeType");
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.define("goog.string.DETECT_DOUBLE_ESCAPING", false);
goog.define("goog.string.FORCE_NON_DOM_HTML_UNESCAPING", false);
goog.string.Unicode = {NBSP:" "};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0;
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};
goog.string.subs = function(str, var_args) {
  var splitParts = str.split("%s");
  var returnString = "";
  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length && splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }
  return returnString + splitParts.join("%s");
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
};
goog.string.isEmptyOrWhitespace = function(str) {
  return /^[\s\xa0]*$/.test(str);
};
goog.string.isEmptyString = function(str) {
  return str.length == 0;
};
goog.string.isEmpty = goog.string.isEmptyOrWhitespace;
goog.string.isEmptyOrWhitespaceSafe = function(str) {
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str));
};
goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};
goog.string.isSpace = function(ch) {
  return ch == " ";
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "" && ch <= "�";
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ");
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n");
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ");
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ");
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
};
goog.string.trim = goog.TRUSTED_SITE && String.prototype.trim ? function(str) {
  return str.trim();
} : function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "");
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "");
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if (test1 < test2) {
    return -1;
  } else {
    if (test1 == test2) {
      return 0;
    } else {
      return 1;
    }
  }
};
goog.string.numberAwareCompare_ = function(str1, str2, tokenizerRegExp) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }
  var tokens1 = str1.toLowerCase().match(tokenizerRegExp);
  var tokens2 = str2.toLowerCase().match(tokenizerRegExp);
  var count = Math.min(tokens1.length, tokens2.length);
  for (var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if (a != b) {
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }
  return str1 < str2 ? -1 : 1;
};
goog.string.intAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\D+/g);
};
goog.string.floatAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\.\d+|\D+/g);
};
goog.string.numerateCompare = goog.string.floatAwareCompare;
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "));
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>");
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if (opt_isLikelyToContainHtmlChars) {
    str = str.replace(goog.string.AMP_RE_, "&amp;").replace(goog.string.LT_RE_, "&lt;").replace(goog.string.GT_RE_, "&gt;").replace(goog.string.QUOT_RE_, "&quot;").replace(goog.string.SINGLE_QUOTE_RE_, "&#39;").replace(goog.string.NULL_RE_, "&#0;");
    if (goog.string.DETECT_DOUBLE_ESCAPING) {
      str = str.replace(goog.string.E_RE_, "&#101;");
    }
    return str;
  } else {
    if (!goog.string.ALL_RE_.test(str)) {
      return str;
    }
    if (str.indexOf("&") != -1) {
      str = str.replace(goog.string.AMP_RE_, "&amp;");
    }
    if (str.indexOf("<") != -1) {
      str = str.replace(goog.string.LT_RE_, "&lt;");
    }
    if (str.indexOf(">") != -1) {
      str = str.replace(goog.string.GT_RE_, "&gt;");
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.QUOT_RE_, "&quot;");
    }
    if (str.indexOf("'") != -1) {
      str = str.replace(goog.string.SINGLE_QUOTE_RE_, "&#39;");
    }
    if (str.indexOf("\x00") != -1) {
      str = str.replace(goog.string.NULL_RE_, "&#0;");
    }
    if (goog.string.DETECT_DOUBLE_ESCAPING && str.indexOf("e") != -1) {
      str = str.replace(goog.string.E_RE_, "&#101;");
    }
    return str;
  }
};
goog.string.AMP_RE_ = /&/g;
goog.string.LT_RE_ = /</g;
goog.string.GT_RE_ = />/g;
goog.string.QUOT_RE_ = /"/g;
goog.string.SINGLE_QUOTE_RE_ = /'/g;
goog.string.NULL_RE_ = /\x00/g;
goog.string.E_RE_ = /e/g;
goog.string.ALL_RE_ = goog.string.DETECT_DOUBLE_ESCAPING ? /[\x00&<>"'e]/ : /[\x00&<>"']/;
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, "&")) {
    if (!goog.string.FORCE_NON_DOM_HTML_UNESCAPING && "document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, "&")) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement("div");
  } else {
    div = goog.global.document.createElement("div");
  }
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if (value) {
      return value;
    }
    if (entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    if (!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    return seen[s] = value;
  });
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      default:
        if (entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        return s;
    }
  });
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml);
};
goog.string.preserveSpaces = function(str) {
  return str.replace(/(^|[\n ]) /g, "$1" + goog.string.Unicode.NBSP);
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (str.length > chars) {
    str = str.substring(0, chars - 3) + "...";
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint);
  } else {
    if (str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos);
    }
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\", "<":"<"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  var sb = ['"'];
  for (var i = 0;i < s.length;i++) {
    var ch = s.charAt(i);
    var cc = ch.charCodeAt(0);
    sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch));
  }
  sb.push('"');
  return sb.join("");
};
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join("");
};
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }
  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    if (cc < 256) {
      rv = "\\x";
      if (cc < 16 || cc > 256) {
        rv += "0";
      }
    } else {
      rv = "\\u";
      if (cc < 4096) {
        rv += "0";
      }
    }
    rv += cc.toString(16).toUpperCase();
  }
  return goog.string.jsEscapeCache_[c] = rv;
};
goog.string.contains = function(str, subString) {
  return str.indexOf(subString) != -1;
};
goog.string.caseInsensitiveContains = function(str, subString) {
  return goog.string.contains(str.toLowerCase(), subString.toLowerCase());
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "");
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "");
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
};
goog.string.repeat = String.prototype.repeat ? function(string, length) {
  return string.repeat(length);
} : function(string, length) {
  return (new Array(length + 1)).join(string);
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s;
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj);
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "");
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for (var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2]);
    } while (order == 0);
  }
  return order;
};
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else {
    if (left > right) {
      return 1;
    }
  }
  return 0;
};
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i) >>> 0;
  }
  return result;
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return "goog_" + goog.string.uniqueStringCounter_++;
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmptyOrWhitespace(str)) {
    return NaN;
  }
  return num;
};
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase();
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  delimiters = delimiters ? "|[" + delimiters + "]+" : "";
  var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};
goog.string.capitalize = function(str) {
  return String(str.charAt(0)).toUpperCase() + String(str.substr(1)).toLowerCase();
};
goog.string.parseInt = function(value) {
  if (isFinite(value)) {
    value = String(value);
  }
  if (goog.isString(value)) {
    return /^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10);
  }
  return NaN;
};
goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }
  return returnVal;
};
goog.string.editDistance = function(a, b) {
  var v0 = [];
  var v1 = [];
  if (a == b) {
    return 0;
  }
  if (!a.length || !b.length) {
    return Math.max(a.length, b.length);
  }
  for (var i = 0;i < b.length + 1;i++) {
    v0[i] = i;
  }
  for (var i = 0;i < a.length;i++) {
    v1[0] = i + 1;
    for (var j = 0;j < b.length;j++) {
      var cost = Number(a[i] != b[j]);
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (var j = 0;j < v0.length;j++) {
      v0[j] = v1[j];
    }
  }
  return v1[b.length];
};
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.dom.NodeType");
goog.require("goog.string");
goog.define("goog.asserts.ENABLE_ASSERTS", goog.DEBUG);
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.DEFAULT_ERROR_HANDLER = function(e) {
  throw e;
};
goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if (givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs;
  } else {
    if (defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs;
    }
  }
  var e = new goog.asserts.AssertionError("" + message, args || []);
  goog.asserts.errorHandler_(e);
};
goog.asserts.setErrorHandler = function(errorHandler) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_ = errorHandler;
  }
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_(new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1)));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) || value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("Expected instanceof %s but got %s.", [goog.asserts.getType_(type), goog.asserts.getType_(value)], opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + " should not be enumerable in Object.prototype.");
  }
};
goog.asserts.getType_ = function(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || "unknown type name";
  } else {
    if (value instanceof Object) {
      return value.constructor.displayName || value.constructor.name || Object.prototype.toString.call(value);
    } else {
      return value === null ? "null" : typeof value;
    }
  }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.define("goog.NATIVE_ARRAY_PROTOTYPES", goog.TRUSTED_SITE);
goog.define("goog.array.ASSUME_NATIVE_FUNCTIONS", false);
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1];
};
goog.array.last = goog.array.peek;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.indexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return Array.prototype.indexOf.call(arr, obj, opt_fromIndex);
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if (goog.isString(arr)) {
    if (!goog.isString(obj) || obj.length != 1) {
      return -1;
    }
    return arr.indexOf(obj, fromIndex);
  }
  for (var i = fromIndex;i < arr.length;i++) {
    if (i in arr && arr[i] === obj) {
      return i;
    }
  }
  return -1;
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.lastIndexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return Array.prototype.lastIndexOf.call(arr, obj, fromIndex);
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if (fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex);
  }
  if (goog.isString(arr)) {
    if (!goog.isString(obj) || obj.length != 1) {
      return -1;
    }
    return arr.lastIndexOf(obj, fromIndex);
  }
  for (var i = fromIndex;i >= 0;i--) {
    if (i in arr && arr[i] === obj) {
      return i;
    }
  }
  return -1;
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.forEach) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  Array.prototype.forEach.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2) {
      f.call((opt_obj), arr2[i], i, arr);
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = l - 1;i >= 0;--i) {
    if (i in arr2) {
      f.call((opt_obj), arr2[i], i, arr);
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.filter) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return Array.prototype.filter.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2) {
      var val = arr2[i];
      if (f.call((opt_obj), val, i, arr)) {
        res[resLength++] = val;
      }
    }
  }
  return res;
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.map) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return Array.prototype.map.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2) {
      res[i] = f.call((opt_obj), arr2[i], i, arr);
    }
  }
  return res;
};
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduce) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  if (opt_obj) {
    f = goog.bind(f, opt_obj);
  }
  return Array.prototype.reduce.call(arr, f, val);
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call((opt_obj), rval, val, index, arr);
  });
  return rval;
};
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduceRight) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.asserts.assert(f != null);
  if (opt_obj) {
    f = goog.bind(f, opt_obj);
  }
  return Array.prototype.reduceRight.call(arr, f, val);
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call((opt_obj), rval, val, index, arr);
  });
  return rval;
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.some) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return Array.prototype.some.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2 && f.call((opt_obj), arr2[i], i, arr)) {
      return true;
    }
  }
  return false;
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.every) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return Array.prototype.every.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2 && !f.call((opt_obj), arr2[i], i, arr)) {
      return false;
    }
  }
  return true;
};
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if (f.call((opt_obj), element, index, arr)) {
      ++count;
    }
  }, opt_obj);
  return count;
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2 && f.call((opt_obj), arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = l - 1;i >= 0;i--) {
    if (i in arr2 && f.call((opt_obj), arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};
goog.array.clear = function(arr) {
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1;i >= 0;i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if (rv = i >= 0) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return Array.prototype.splice.call(arr, i, 1).length == 1;
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};
goog.array.removeAllIf = function(arr, f, opt_obj) {
  var removedCount = 0;
  goog.array.forEachRight(arr, function(val, index) {
    if (f.call((opt_obj), val, index, arr)) {
      if (goog.array.removeAt(arr, index)) {
        removedCount++;
      }
    }
  });
  return removedCount;
};
goog.array.concat = function(var_args) {
  return Array.prototype.concat.apply(Array.prototype, arguments);
};
goog.array.join = function(var_args) {
  return Array.prototype.concat.apply(Array.prototype, arguments);
};
goog.array.toArray = function(object) {
  var length = object.length;
  if (length > 0) {
    var rv = new Array(length);
    for (var i = 0;i < length;i++) {
      rv[i] = object[i];
    }
    return rv;
  }
  return [];
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for (var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    if (goog.isArrayLike(arr2)) {
      var len1 = arr1.length || 0;
      var len2 = arr2.length || 0;
      arr1.length = len1 + len2;
      for (var j = 0;j < len2;j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return Array.prototype.splice.apply(arr, goog.array.slice(arguments, 1));
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if (arguments.length <= 2) {
    return Array.prototype.slice.call(arr, start);
  } else {
    return Array.prototype.slice.call(arr, start, opt_end);
  }
};
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  var returnArray = opt_rv || arr;
  var defaultHashFn = function(item) {
    return goog.isObject(item) ? "o" + goog.getUid(item) : (typeof item).charAt(0) + item;
  };
  var hashFn = opt_hashFn || defaultHashFn;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = hashFn(current);
    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target);
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj);
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while (left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = (compareFn)(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      found = !compareResult;
    }
  }
  return found ? left : ~left;
};
goog.array.sort = function(arr, opt_compareFn) {
  arr.sort(opt_compareFn || goog.array.defaultCompare);
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  }
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value;
  }
};
goog.array.sortByKey = function(arr, keyFn, opt_compareFn) {
  var keyCompareFn = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return keyCompareFn(keyFn(a), keyFn(b));
  });
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  goog.array.sortByKey(arr, function(obj) {
    return obj[key];
  }, opt_compareFn);
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0;i < l;i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};
goog.array.inverseDefaultCompare = function(a, b) {
  return -goog.array.defaultCompare(a, b);
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false;
};
goog.array.bucket = function(array, sorter, opt_obj) {
  var buckets = {};
  for (var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter.call((opt_obj), value, i, array);
    if (goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }
  return buckets;
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call((opt_obj), element, index, arr)] = element;
  });
  return ret;
};
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if (opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end;
  }
  if (step * (end - start) < 0) {
    return [];
  }
  if (step > 0) {
    for (var i = start;i < end;i += step) {
      array.push(i);
    }
  } else {
    for (var i = start;i > end;i += step) {
      array.push(i);
    }
  }
  return array;
};
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0;i < n;i++) {
    array[i] = value;
  }
  return array;
};
goog.array.flatten = function(var_args) {
  var CHUNK_SIZE = 8192;
  var result = [];
  for (var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      for (var c = 0;c < element.length;c += CHUNK_SIZE) {
        var chunk = goog.array.slice(element, c, c + CHUNK_SIZE);
        var recurseResult = goog.array.flatten.apply(null, chunk);
        for (var r = 0;r < recurseResult.length;r++) {
          result.push(recurseResult[r]);
        }
      }
    } else {
      result.push(element);
    }
  }
  return result;
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if (array.length) {
    n %= array.length;
    if (n > 0) {
      Array.prototype.unshift.apply(array, array.splice(-n, n));
    } else {
      if (n < 0) {
        Array.prototype.push.apply(array, array.splice(0, -n));
      }
    }
  }
  return array;
};
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
  goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
  var removedItems = Array.prototype.splice.call(arr, fromIndex, 1);
  Array.prototype.splice.call(arr, toIndex, 0, removedItems[0]);
};
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  var minLen = arguments[0].length;
  for (var i = 1;i < arguments.length;i++) {
    if (arguments[i].length < minLen) {
      minLen = arguments[i].length;
    }
  }
  for (var i = 0;i < minLen;i++) {
    var value = [];
    for (var j = 0;j < arguments.length;j++) {
      value.push(arguments[j][i]);
    }
    result.push(value);
  }
  return result;
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for (var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};
goog.array.copyByIndex = function(arr, index_arr) {
  var result = [];
  goog.array.forEach(index_arr, function(index) {
    result.push(arr[index]);
  });
  return result;
};
goog.provide("goog.labs.userAgent.util");
goog.require("goog.string");
goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
  var navigator = goog.labs.userAgent.util.getNavigator_();
  if (navigator) {
    var userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return "";
};
goog.labs.userAgent.util.getNavigator_ = function() {
  return goog.global.navigator;
};
goog.labs.userAgent.util.userAgent_ = goog.labs.userAgent.util.getNativeUserAgentString_();
goog.labs.userAgent.util.setUserAgent = function(opt_userAgent) {
  goog.labs.userAgent.util.userAgent_ = opt_userAgent || goog.labs.userAgent.util.getNativeUserAgentString_();
};
goog.labs.userAgent.util.getUserAgent = function() {
  return goog.labs.userAgent.util.userAgent_;
};
goog.labs.userAgent.util.matchUserAgent = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.contains(userAgent, str);
};
goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.caseInsensitiveContains(userAgent, str);
};
goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
  var versionRegExp = new RegExp("(\\w[\\w ]+)" + "/" + "([^\\s]+)" + "\\s*" + "(?:\\((.*?)\\))?", "g");
  var data = [];
  var match;
  while (match = versionRegExp.exec(userAgent)) {
    data.push([match[1], match[2], match[3] || undefined]);
  }
  return data;
};
goog.provide("goog.labs.userAgent.engine");
goog.require("goog.array");
goog.require("goog.labs.userAgent.util");
goog.require("goog.string");
goog.labs.userAgent.engine.isPresto = function() {
  return goog.labs.userAgent.util.matchUserAgent("Presto");
};
goog.labs.userAgent.engine.isTrident = function() {
  return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
};
goog.labs.userAgent.engine.isEdge = function() {
  return goog.labs.userAgent.util.matchUserAgent("Edge");
};
goog.labs.userAgent.engine.isWebKit = function() {
  return goog.labs.userAgent.util.matchUserAgentIgnoreCase("WebKit") && !goog.labs.userAgent.engine.isEdge();
};
goog.labs.userAgent.engine.isGecko = function() {
  return goog.labs.userAgent.util.matchUserAgent("Gecko") && !goog.labs.userAgent.engine.isWebKit() && !goog.labs.userAgent.engine.isTrident() && !goog.labs.userAgent.engine.isEdge();
};
goog.labs.userAgent.engine.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  if (userAgentString) {
    var tuples = goog.labs.userAgent.util.extractVersionTuples(userAgentString);
    var engineTuple = goog.labs.userAgent.engine.getEngineTuple_(tuples);
    if (engineTuple) {
      if (engineTuple[0] == "Gecko") {
        return goog.labs.userAgent.engine.getVersionForKey_(tuples, "Firefox");
      }
      return engineTuple[1];
    }
    var browserTuple = tuples[0];
    var info;
    if (browserTuple && (info = browserTuple[2])) {
      var match = /Trident\/([^\s;]+)/.exec(info);
      if (match) {
        return match[1];
      }
    }
  }
  return "";
};
goog.labs.userAgent.engine.getEngineTuple_ = function(tuples) {
  if (!goog.labs.userAgent.engine.isEdge()) {
    return tuples[1];
  }
  for (var i = 0;i < tuples.length;i++) {
    var tuple = tuples[i];
    if (tuple[0] == "Edge") {
      return tuple;
    }
  }
};
goog.labs.userAgent.engine.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(), version) >= 0;
};
goog.labs.userAgent.engine.getVersionForKey_ = function(tuples, key) {
  var pair = goog.array.find(tuples, function(pair) {
    return key == pair[0];
  });
  return pair && pair[1] || "";
};
goog.provide("goog.labs.userAgent.platform");
goog.require("goog.labs.userAgent.util");
goog.require("goog.string");
goog.labs.userAgent.platform.isAndroid = function() {
  return goog.labs.userAgent.util.matchUserAgent("Android");
};
goog.labs.userAgent.platform.isIpod = function() {
  return goog.labs.userAgent.util.matchUserAgent("iPod");
};
goog.labs.userAgent.platform.isIphone = function() {
  return goog.labs.userAgent.util.matchUserAgent("iPhone") && !goog.labs.userAgent.util.matchUserAgent("iPod") && !goog.labs.userAgent.util.matchUserAgent("iPad");
};
goog.labs.userAgent.platform.isIpad = function() {
  return goog.labs.userAgent.util.matchUserAgent("iPad");
};
goog.labs.userAgent.platform.isIos = function() {
  return goog.labs.userAgent.platform.isIphone() || goog.labs.userAgent.platform.isIpad() || goog.labs.userAgent.platform.isIpod();
};
goog.labs.userAgent.platform.isMacintosh = function() {
  return goog.labs.userAgent.util.matchUserAgent("Macintosh");
};
goog.labs.userAgent.platform.isLinux = function() {
  return goog.labs.userAgent.util.matchUserAgent("Linux");
};
goog.labs.userAgent.platform.isWindows = function() {
  return goog.labs.userAgent.util.matchUserAgent("Windows");
};
goog.labs.userAgent.platform.isChromeOS = function() {
  return goog.labs.userAgent.util.matchUserAgent("CrOS");
};
goog.labs.userAgent.platform.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  var version = "", re;
  if (goog.labs.userAgent.platform.isWindows()) {
    re = /Windows (?:NT|Phone) ([0-9.]+)/;
    var match = re.exec(userAgentString);
    if (match) {
      version = match[1];
    } else {
      version = "0.0";
    }
  } else {
    if (goog.labs.userAgent.platform.isIos()) {
      re = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/;
      var match = re.exec(userAgentString);
      version = match && match[1].replace(/_/g, ".");
    } else {
      if (goog.labs.userAgent.platform.isMacintosh()) {
        re = /Mac OS X ([0-9_.]+)/;
        var match = re.exec(userAgentString);
        version = match ? match[1].replace(/_/g, ".") : "10";
      } else {
        if (goog.labs.userAgent.platform.isAndroid()) {
          re = /Android\s+([^\);]+)(\)|;)/;
          var match = re.exec(userAgentString);
          version = match && match[1];
        } else {
          if (goog.labs.userAgent.platform.isChromeOS()) {
            re = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/;
            var match = re.exec(userAgentString);
            version = match && match[1];
          }
        }
      }
    }
  }
  return version || "";
};
goog.labs.userAgent.platform.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(), version) >= 0;
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call((opt_obj), obj[key], key, obj);
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call((opt_obj), obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call((opt_obj), obj[key], key, obj);
  }
  return res;
};
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call((opt_obj), obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call((opt_obj), obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for (var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }
  return obj;
};
goog.object.containsKey = function(obj, key) {
  return obj !== null && key in obj;
};
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call((opt_this), obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if (rv = key in (obj)) {
    delete obj[key];
  }
  return rv;
};
goog.object.add = function(obj, key, val) {
  if (obj !== null && key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};
goog.object.get = function(obj, key, opt_val) {
  if (obj !== null && key in obj) {
    return obj[key];
  }
  return opt_val;
};
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in (obj) ? obj[key] : obj[key] = value;
};
goog.object.setWithReturnValueIfNotSet = function(obj, key, f) {
  if (key in obj) {
    return obj[key];
  }
  var val = f();
  obj[key] = val;
  return val;
};
goog.object.equals = function(a, b) {
  for (var k in a) {
    if (!(k in b) || a[k] !== b[k]) {
      return false;
    }
  }
  for (var k in b) {
    if (!(k in a)) {
      return false;
    }
  }
  return true;
};
goog.object.clone = function(obj) {
  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == "object" || type == "array") {
    if (goog.isFunction(obj.clone)) {
      return obj.clone();
    }
    var clone = type == "array" ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }
    for (var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }
  if (argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for (var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }
  var rv = {};
  for (var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
};
goog.object.isImmutableView = function(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
};
goog.provide("goog.labs.userAgent.browser");
goog.require("goog.array");
goog.require("goog.labs.userAgent.util");
goog.require("goog.object");
goog.require("goog.string");
goog.labs.userAgent.browser.matchOpera_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Opera") || goog.labs.userAgent.util.matchUserAgent("OPR");
};
goog.labs.userAgent.browser.matchIE_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
};
goog.labs.userAgent.browser.matchEdge_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Edge");
};
goog.labs.userAgent.browser.matchFirefox_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Firefox");
};
goog.labs.userAgent.browser.matchSafari_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Safari") && !(goog.labs.userAgent.browser.matchChrome_() || goog.labs.userAgent.browser.matchCoast_() || goog.labs.userAgent.browser.matchOpera_() || goog.labs.userAgent.browser.matchEdge_() || goog.labs.userAgent.browser.isSilk() || goog.labs.userAgent.util.matchUserAgent("Android"));
};
goog.labs.userAgent.browser.matchCoast_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Coast");
};
goog.labs.userAgent.browser.matchIosWebview_ = function() {
  return (goog.labs.userAgent.util.matchUserAgent("iPad") || goog.labs.userAgent.util.matchUserAgent("iPhone")) && !goog.labs.userAgent.browser.matchSafari_() && !goog.labs.userAgent.browser.matchChrome_() && !goog.labs.userAgent.browser.matchCoast_() && goog.labs.userAgent.util.matchUserAgent("AppleWebKit");
};
goog.labs.userAgent.browser.matchChrome_ = function() {
  return (goog.labs.userAgent.util.matchUserAgent("Chrome") || goog.labs.userAgent.util.matchUserAgent("CriOS")) && !goog.labs.userAgent.browser.matchOpera_() && !goog.labs.userAgent.browser.matchEdge_();
};
goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Android") && !(goog.labs.userAgent.browser.isChrome() || goog.labs.userAgent.browser.isFirefox() || goog.labs.userAgent.browser.isOpera() || goog.labs.userAgent.browser.isSilk());
};
goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;
goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;
goog.labs.userAgent.browser.isEdge = goog.labs.userAgent.browser.matchEdge_;
goog.labs.userAgent.browser.isFirefox = goog.labs.userAgent.browser.matchFirefox_;
goog.labs.userAgent.browser.isSafari = goog.labs.userAgent.browser.matchSafari_;
goog.labs.userAgent.browser.isCoast = goog.labs.userAgent.browser.matchCoast_;
goog.labs.userAgent.browser.isIosWebview = goog.labs.userAgent.browser.matchIosWebview_;
goog.labs.userAgent.browser.isChrome = goog.labs.userAgent.browser.matchChrome_;
goog.labs.userAgent.browser.isAndroidBrowser = goog.labs.userAgent.browser.matchAndroidBrowser_;
goog.labs.userAgent.browser.isSilk = function() {
  return goog.labs.userAgent.util.matchUserAgent("Silk");
};
goog.labs.userAgent.browser.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  if (goog.labs.userAgent.browser.isIE()) {
    return goog.labs.userAgent.browser.getIEVersion_(userAgentString);
  }
  var versionTuples = goog.labs.userAgent.util.extractVersionTuples(userAgentString);
  var versionMap = {};
  goog.array.forEach(versionTuples, function(tuple) {
    var key = tuple[0];
    var value = tuple[1];
    versionMap[key] = value;
  });
  var versionMapHasKey = goog.partial(goog.object.containsKey, versionMap);
  function lookUpValueWithKeys(keys) {
    var key = goog.array.find(keys, versionMapHasKey);
    return versionMap[key] || "";
  }
  if (goog.labs.userAgent.browser.isOpera()) {
    return lookUpValueWithKeys(["Version", "Opera", "OPR"]);
  }
  if (goog.labs.userAgent.browser.isEdge()) {
    return lookUpValueWithKeys(["Edge"]);
  }
  if (goog.labs.userAgent.browser.isChrome()) {
    return lookUpValueWithKeys(["Chrome", "CriOS"]);
  }
  var tuple = versionTuples[2];
  return tuple && tuple[1] || "";
};
goog.labs.userAgent.browser.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(), version) >= 0;
};
goog.labs.userAgent.browser.getIEVersion_ = function(userAgent) {
  var rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return rv[1];
  }
  var version = "";
  var msie = /MSIE +([\d\.]+)/.exec(userAgent);
  if (msie && msie[1]) {
    var tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
    if (msie[1] == "7.0") {
      if (tridentVersion && tridentVersion[1]) {
        switch(tridentVersion[1]) {
          case "4.0":
            version = "8.0";
            break;
          case "5.0":
            version = "9.0";
            break;
          case "6.0":
            version = "10.0";
            break;
          case "7.0":
            version = "11.0";
            break;
        }
      } else {
        version = "7.0";
      }
    } else {
      version = msie[1];
    }
  }
  return version;
};
goog.provide("goog.userAgent");
goog.require("goog.labs.userAgent.browser");
goog.require("goog.labs.userAgent.engine");
goog.require("goog.labs.userAgent.platform");
goog.require("goog.labs.userAgent.util");
goog.require("goog.string");
goog.define("goog.userAgent.ASSUME_IE", false);
goog.define("goog.userAgent.ASSUME_EDGE", false);
goog.define("goog.userAgent.ASSUME_GECKO", false);
goog.define("goog.userAgent.ASSUME_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_MOBILE_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_OPERA", false);
goog.define("goog.userAgent.ASSUME_ANY_VERSION", false);
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.labs.userAgent.util.getUserAgent();
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"] || null;
};
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.labs.userAgent.browser.isOpera();
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.labs.userAgent.browser.isIE();
goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_EDGE : goog.labs.userAgent.engine.isEdge();
goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.labs.userAgent.engine.isGecko();
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.labs.userAgent.engine.isWebKit();
goog.userAgent.isMobile_ = function() {
  return goog.userAgent.WEBKIT && goog.labs.userAgent.util.matchUserAgent("Mobile");
};
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.isMobile_();
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || "";
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.define("goog.userAgent.ASSUME_MAC", false);
goog.define("goog.userAgent.ASSUME_WINDOWS", false);
goog.define("goog.userAgent.ASSUME_LINUX", false);
goog.define("goog.userAgent.ASSUME_X11", false);
goog.define("goog.userAgent.ASSUME_ANDROID", false);
goog.define("goog.userAgent.ASSUME_IPHONE", false);
goog.define("goog.userAgent.ASSUME_IPAD", false);
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD;
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.labs.userAgent.platform.isMacintosh();
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.labs.userAgent.platform.isWindows();
goog.userAgent.isLegacyLinux_ = function() {
  return goog.labs.userAgent.platform.isLinux() || goog.labs.userAgent.platform.isChromeOS();
};
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.isLegacyLinux_();
goog.userAgent.isX11_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return !!navigator && goog.string.contains(navigator["appVersion"] || "", "X11");
};
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.isX11_();
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.labs.userAgent.platform.isAndroid();
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.labs.userAgent.platform.isIphone();
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.labs.userAgent.platform.isIpad();
goog.userAgent.operaVersion_ = function() {
  var version = goog.global.opera.version;
  try {
    return version();
  } catch (e) {
    return version;
  }
};
goog.userAgent.determineVersion_ = function() {
  if (goog.userAgent.OPERA && goog.global["opera"]) {
    return goog.userAgent.operaVersion_();
  }
  var version = "";
  var arr = goog.userAgent.getVersionRegexResult_();
  if (arr) {
    version = arr ? arr[1] : "";
  }
  if (goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};
goog.userAgent.getVersionRegexResult_ = function() {
  var userAgent = goog.userAgent.getUserAgentString();
  if (goog.userAgent.GECKO) {
    return /rv\:([^\);]+)(\)|;)/.exec(userAgent);
  }
  if (goog.userAgent.EDGE) {
    return /Edge\/([\d\.]+)/.exec(userAgent);
  }
  if (goog.userAgent.IE) {
    return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(userAgent);
  }
  if (goog.userAgent.WEBKIT) {
    return /WebKit\/(\S+)/.exec(userAgent);
  }
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined;
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};
goog.userAgent.isVersionOrHigherCache_ = {};
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionOrHigherCache_[version] || (goog.userAgent.isVersionOrHigherCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return Number(goog.userAgent.DOCUMENT_MODE) >= documentMode;
};
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
goog.userAgent.DOCUMENT_MODE = function() {
  var doc = goog.global["document"];
  var mode = goog.userAgent.getDocumentMode_();
  if (!doc || !goog.userAgent.IE) {
    return undefined;
  }
  return mode || (doc["compatMode"] == "CSS1Compat" ? parseInt(goog.userAgent.VERSION, 10) : 5);
}();
goog.provide("goog.events.BrowserFeature");
goog.require("goog.userAgent");
goog.events.BrowserFeature = {HAS_W3C_BUTTON:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), HAS_W3C_EVENT_SUPPORT:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), SET_KEY_CODE_TO_PREVENT_DEFAULT:goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), HAS_NAVIGATOR_ONLINE_PROPERTY:!goog.userAgent.WEBKIT || goog.userAgent.isVersionOrHigher("528"), HAS_HTML5_NETWORK_EVENT_SUPPORT:goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9b") || goog.userAgent.IE && 
goog.userAgent.isVersionOrHigher("8") || goog.userAgent.OPERA && goog.userAgent.isVersionOrHigher("9.5") || goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("528"), HTML5_NETWORK_EVENTS_FIRE_ON_BODY:goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher("8") || goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), TOUCH_ENABLED:"ontouchstart" in goog.global || !!(goog.global["document"] && document.documentElement && "ontouchstart" in document.documentElement) || !!(goog.global["navigator"] && 
goog.global["navigator"]["msMaxTouchPoints"])};
goog.provide("goog.events.EventId");
goog.events.EventId = function(eventId) {
  this.id = eventId;
};
goog.events.EventId.prototype.toString = function() {
  return this.id;
};
goog.provide("goog.events.Listenable");
goog.provide("goog.events.ListenableKey");
goog.require("goog.events.EventId");
goog.forwardDeclare("goog.events.EventLike");
goog.forwardDeclare("goog.events.EventTarget");
goog.events.Listenable = function() {
};
goog.events.Listenable.IMPLEMENTED_BY_PROP = "closure_listenable_" + (Math.random() * 1E6 | 0);
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP] = true;
};
goog.events.Listenable.isImplementedBy = function(obj) {
  return !!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP]);
};
goog.events.Listenable.prototype.listen;
goog.events.Listenable.prototype.listenOnce;
goog.events.Listenable.prototype.unlisten;
goog.events.Listenable.prototype.unlistenByKey;
goog.events.Listenable.prototype.dispatchEvent;
goog.events.Listenable.prototype.removeAllListeners;
goog.events.Listenable.prototype.getParentEventTarget;
goog.events.Listenable.prototype.fireListeners;
goog.events.Listenable.prototype.getListeners;
goog.events.Listenable.prototype.getListener;
goog.events.Listenable.prototype.hasListener;
goog.events.ListenableKey = function() {
};
goog.events.ListenableKey.counter_ = 0;
goog.events.ListenableKey.reserveKey = function() {
  return ++goog.events.ListenableKey.counter_;
};
goog.events.ListenableKey.prototype.src;
goog.events.ListenableKey.prototype.type;
goog.events.ListenableKey.prototype.listener;
goog.events.ListenableKey.prototype.capture;
goog.events.ListenableKey.prototype.handler;
goog.events.ListenableKey.prototype.key;
goog.provide("goog.events.EventType");
goog.require("goog.userAgent");
goog.events.getVendorPrefixedName_ = function(eventName) {
  return goog.userAgent.WEBKIT ? "webkit" + eventName : goog.userAgent.OPERA ? "o" + eventName.toLowerCase() : eventName.toLowerCase();
};
goog.events.EventType = {CLICK:"click", RIGHTCLICK:"rightclick", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", MOUSEENTER:"mouseenter", MOUSELEAVE:"mouseleave", SELECTSTART:"selectstart", WHEEL:"wheel", KEYPRESS:"keypress", KEYDOWN:"keydown", KEYUP:"keyup", BLUR:"blur", FOCUS:"focus", DEACTIVATE:"deactivate", FOCUSIN:goog.userAgent.IE ? "focusin" : "DOMFocusIn", FOCUSOUT:goog.userAgent.IE ? "focusout" : "DOMFocusOut", 
CHANGE:"change", RESET:"reset", SELECT:"select", SUBMIT:"submit", INPUT:"input", PROPERTYCHANGE:"propertychange", DRAGSTART:"dragstart", DRAG:"drag", DRAGENTER:"dragenter", DRAGOVER:"dragover", DRAGLEAVE:"dragleave", DROP:"drop", DRAGEND:"dragend", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", BEFOREUNLOAD:"beforeunload", CONSOLEMESSAGE:"consolemessage", CONTEXTMENU:"contextmenu", DOMCONTENTLOADED:"DOMContentLoaded", ERROR:"error", HELP:"help", LOAD:"load", 
LOSECAPTURE:"losecapture", ORIENTATIONCHANGE:"orientationchange", READYSTATECHANGE:"readystatechange", RESIZE:"resize", SCROLL:"scroll", UNLOAD:"unload", HASHCHANGE:"hashchange", PAGEHIDE:"pagehide", PAGESHOW:"pageshow", POPSTATE:"popstate", COPY:"copy", PASTE:"paste", CUT:"cut", BEFORECOPY:"beforecopy", BEFORECUT:"beforecut", BEFOREPASTE:"beforepaste", ONLINE:"online", OFFLINE:"offline", MESSAGE:"message", CONNECT:"connect", ANIMATIONSTART:goog.events.getVendorPrefixedName_("AnimationStart"), ANIMATIONEND:goog.events.getVendorPrefixedName_("AnimationEnd"), 
ANIMATIONITERATION:goog.events.getVendorPrefixedName_("AnimationIteration"), TRANSITIONEND:goog.events.getVendorPrefixedName_("TransitionEnd"), POINTERDOWN:"pointerdown", POINTERUP:"pointerup", POINTERCANCEL:"pointercancel", POINTERMOVE:"pointermove", POINTEROVER:"pointerover", POINTEROUT:"pointerout", POINTERENTER:"pointerenter", POINTERLEAVE:"pointerleave", GOTPOINTERCAPTURE:"gotpointercapture", LOSTPOINTERCAPTURE:"lostpointercapture", MSGESTURECHANGE:"MSGestureChange", MSGESTUREEND:"MSGestureEnd", 
MSGESTUREHOLD:"MSGestureHold", MSGESTURESTART:"MSGestureStart", MSGESTURETAP:"MSGestureTap", MSGOTPOINTERCAPTURE:"MSGotPointerCapture", MSINERTIASTART:"MSInertiaStart", MSLOSTPOINTERCAPTURE:"MSLostPointerCapture", MSPOINTERCANCEL:"MSPointerCancel", MSPOINTERDOWN:"MSPointerDown", MSPOINTERENTER:"MSPointerEnter", MSPOINTERHOVER:"MSPointerHover", MSPOINTERLEAVE:"MSPointerLeave", MSPOINTERMOVE:"MSPointerMove", MSPOINTEROUT:"MSPointerOut", MSPOINTEROVER:"MSPointerOver", MSPOINTERUP:"MSPointerUp", TEXT:"text", 
TEXTINPUT:"textInput", COMPOSITIONSTART:"compositionstart", COMPOSITIONUPDATE:"compositionupdate", COMPOSITIONEND:"compositionend", EXIT:"exit", LOADABORT:"loadabort", LOADCOMMIT:"loadcommit", LOADREDIRECT:"loadredirect", LOADSTART:"loadstart", LOADSTOP:"loadstop", RESPONSIVE:"responsive", SIZECHANGED:"sizechanged", UNRESPONSIVE:"unresponsive", VISIBILITYCHANGE:"visibilitychange", STORAGE:"storage", DOMSUBTREEMODIFIED:"DOMSubtreeModified", DOMNODEINSERTED:"DOMNodeInserted", DOMNODEREMOVED:"DOMNodeRemoved", 
DOMNODEREMOVEDFROMDOCUMENT:"DOMNodeRemovedFromDocument", DOMNODEINSERTEDINTODOCUMENT:"DOMNodeInsertedIntoDocument", DOMATTRMODIFIED:"DOMAttrModified", DOMCHARACTERDATAMODIFIED:"DOMCharacterDataModified", BEFOREPRINT:"beforeprint", AFTERPRINT:"afterprint"};
goog.provide("goog.reflect");
goog.reflect.object = function(type, object) {
  return object;
};
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[" "](x);
  return x;
};
goog.reflect.sinkValue[" "] = goog.nullFunction;
goog.reflect.canAccessProperty = function(obj, prop) {
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true;
  } catch (e) {
  }
  return false;
};
goog.provide("goog.disposable.IDisposable");
goog.disposable.IDisposable = function() {
};
goog.disposable.IDisposable.prototype.dispose = goog.abstractMethod;
goog.disposable.IDisposable.prototype.isDisposed = goog.abstractMethod;
goog.provide("goog.Disposable");
goog.provide("goog.dispose");
goog.provide("goog.disposeAll");
goog.require("goog.disposable.IDisposable");
goog.Disposable = function() {
  if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    if (goog.Disposable.INCLUDE_STACK_ON_CREATION) {
      this.creationStack = (new Error).stack;
    }
    goog.Disposable.instances_[goog.getUid(this)] = this;
  }
  this.disposed_ = this.disposed_;
  this.onDisposeCallbacks_ = this.onDisposeCallbacks_;
};
goog.Disposable.MonitoringMode = {OFF:0, PERMANENT:1, INTERACTIVE:2};
goog.define("goog.Disposable.MONITORING_MODE", 0);
goog.define("goog.Disposable.INCLUDE_STACK_ON_CREATION", true);
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for (var id in goog.Disposable.instances_) {
    if (goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)]);
    }
  }
  return ret;
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {};
};
goog.Disposable.prototype.disposed_ = false;
goog.Disposable.prototype.onDisposeCallbacks_;
goog.Disposable.prototype.creationStack;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
    if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.getUid(this);
      if (goog.Disposable.MONITORING_MODE == goog.Disposable.MonitoringMode.PERMANENT && !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + " did not call the goog.Disposable base " + "constructor or was disposed of after a clearUndisposedObjects " + "call");
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};
goog.Disposable.prototype.registerDisposable = function(disposable) {
  this.addOnDisposeCallback(goog.partial(goog.dispose, disposable));
};
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  if (this.disposed_) {
    callback.call(opt_scope);
    return;
  }
  if (!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = [];
  }
  this.onDisposeCallbacks_.push(goog.isDef(opt_scope) ? goog.bind(callback, opt_scope) : callback);
};
goog.Disposable.prototype.disposeInternal = function() {
  if (this.onDisposeCallbacks_) {
    while (this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()();
    }
  }
};
goog.Disposable.isDisposed = function(obj) {
  if (obj && typeof obj.isDisposed == "function") {
    return obj.isDisposed();
  }
  return false;
};
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == "function") {
    obj.dispose();
  }
};
goog.disposeAll = function(var_args) {
  for (var i = 0, len = arguments.length;i < len;++i) {
    var disposable = arguments[i];
    if (goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable);
    } else {
      goog.dispose(disposable);
    }
  }
};
goog.provide("goog.events.Event");
goog.provide("goog.events.EventLike");
goog.require("goog.Disposable");
goog.require("goog.events.EventId");
goog.events.EventLike;
goog.events.Event = function(type, opt_target) {
  this.type = type instanceof goog.events.EventId ? String(type) : type;
  this.target = opt_target;
  this.currentTarget = this.target;
  this.propagationStopped_ = false;
  this.defaultPrevented = false;
  this.returnValue_ = true;
};
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};
goog.events.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.returnValue_ = false;
};
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation();
};
goog.events.Event.preventDefault = function(e) {
  e.preventDefault();
};
goog.provide("goog.events.BrowserEvent");
goog.provide("goog.events.BrowserEvent.MouseButton");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.reflect");
goog.require("goog.userAgent");
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  goog.events.BrowserEvent.base(this, "constructor", opt_e ? opt_e.type : "");
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null;
  this.offsetX = 0;
  this.offsetY = 0;
  this.clientX = 0;
  this.clientY = 0;
  this.screenX = 0;
  this.screenY = 0;
  this.button = 0;
  this.keyCode = 0;
  this.charCode = 0;
  this.ctrlKey = false;
  this.altKey = false;
  this.shiftKey = false;
  this.metaKey = false;
  this.state = null;
  this.platformModifierKey = false;
  this.event_ = null;
  if (opt_e) {
    this.init(opt_e, opt_currentTarget);
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);
goog.events.BrowserEvent.MouseButton = {LEFT:0, MIDDLE:1, RIGHT:2};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  var relevantTouch = e.changedTouches ? e.changedTouches[0] : null;
  this.target = (e.target) || e.srcElement;
  this.currentTarget = (opt_currentTarget);
  var relatedTarget = (e.relatedTarget);
  if (relatedTarget) {
    if (goog.userAgent.GECKO) {
      if (!goog.reflect.canAccessProperty(relatedTarget, "nodeName")) {
        relatedTarget = null;
      }
    }
  } else {
    if (type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement;
    } else {
      if (type == goog.events.EventType.MOUSEOUT) {
        relatedTarget = e.toElement;
      }
    }
  }
  this.relatedTarget = relatedTarget;
  if (!goog.isNull(relevantTouch)) {
    this.clientX = relevantTouch.clientX !== undefined ? relevantTouch.clientX : relevantTouch.pageX;
    this.clientY = relevantTouch.clientY !== undefined ? relevantTouch.clientY : relevantTouch.pageY;
    this.screenX = relevantTouch.screenX || 0;
    this.screenY = relevantTouch.screenY || 0;
  } else {
    this.offsetX = goog.userAgent.WEBKIT || e.offsetX !== undefined ? e.offsetX : e.layerX;
    this.offsetY = goog.userAgent.WEBKIT || e.offsetY !== undefined ? e.offsetY : e.layerY;
    this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
    this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
    this.screenX = e.screenX || 0;
    this.screenY = e.screenY || 0;
  }
  this.button = e.button;
  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == "keypress" ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  if (e.defaultPrevented) {
    this.preventDefault();
  }
};
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if (this.type == "click") {
      return button == goog.events.BrowserEvent.MouseButton.LEFT;
    } else {
      return !!(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button]);
    }
  } else {
    return this.event_.button == button;
  }
};
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey);
};
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if (!be.preventDefault) {
    be.returnValue = false;
    if (goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      try {
        var VK_F1 = 112;
        var VK_F12 = 123;
        if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1;
        }
      } catch (ex) {
      }
    }
  } else {
    be.preventDefault();
  }
};
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};
goog.provide("goog.debug.EntryPointMonitor");
goog.provide("goog.debug.entryPointRegistry");
goog.require("goog.asserts");
goog.debug.EntryPointMonitor = function() {
};
goog.debug.EntryPointMonitor.prototype.wrap;
goog.debug.EntryPointMonitor.prototype.unwrap;
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.monitors_ = [];
goog.debug.entryPointRegistry.monitorsMayExist_ = false;
goog.debug.entryPointRegistry.register = function(callback) {
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = callback;
  if (goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for (var i = 0;i < monitors.length;i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]));
    }
  }
};
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for (var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor);
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1], "Only the most recent monitor can be unwrapped.");
  var transformer = goog.bind(monitor.unwrap, monitor);
  for (var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  monitors.length--;
};
goog.provide("goog.events.Listener");
goog.require("goog.events.ListenableKey");
goog.events.Listener = function(listener, proxy, src, type, capture, opt_handler) {
  if (goog.events.Listener.ENABLE_MONITORING) {
    this.creationStack = (new Error).stack;
  }
  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.key = goog.events.ListenableKey.reserveKey();
  this.callOnce = false;
  this.removed = false;
};
goog.define("goog.events.Listener.ENABLE_MONITORING", false);
goog.events.Listener.prototype.creationStack;
goog.events.Listener.prototype.markAsRemoved = function() {
  this.removed = true;
  this.listener = null;
  this.proxy = null;
  this.src = null;
  this.handler = null;
};
goog.provide("goog.events.ListenerMap");
goog.require("goog.array");
goog.require("goog.events.Listener");
goog.require("goog.object");
goog.events.ListenerMap = function(src) {
  this.src = src;
  this.listeners = {};
  this.typeCount_ = 0;
};
goog.events.ListenerMap.prototype.getTypeCount = function() {
  return this.typeCount_;
};
goog.events.ListenerMap.prototype.getListenerCount = function() {
  var count = 0;
  for (var type in this.listeners) {
    count += this.listeners[type].length;
  }
  return count;
};
goog.events.ListenerMap.prototype.add = function(type, listener, callOnce, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  var listenerArray = this.listeners[typeStr];
  if (!listenerArray) {
    listenerArray = this.listeners[typeStr] = [];
    this.typeCount_++;
  }
  var listenerObj;
  var index = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    listenerObj = listenerArray[index];
    if (!callOnce) {
      listenerObj.callOnce = false;
    }
  } else {
    listenerObj = new goog.events.Listener(listener, null, this.src, typeStr, !!opt_useCapture, opt_listenerScope);
    listenerObj.callOnce = callOnce;
    listenerArray.push(listenerObj);
  }
  return listenerObj;
};
goog.events.ListenerMap.prototype.remove = function(type, listener, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  if (!(typeStr in this.listeners)) {
    return false;
  }
  var listenerArray = this.listeners[typeStr];
  var index = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    var listenerObj = listenerArray[index];
    listenerObj.markAsRemoved();
    goog.array.removeAt(listenerArray, index);
    if (listenerArray.length == 0) {
      delete this.listeners[typeStr];
      this.typeCount_--;
    }
    return true;
  }
  return false;
};
goog.events.ListenerMap.prototype.removeByKey = function(listener) {
  var type = listener.type;
  if (!(type in this.listeners)) {
    return false;
  }
  var removed = goog.array.remove(this.listeners[type], listener);
  if (removed) {
    listener.markAsRemoved();
    if (this.listeners[type].length == 0) {
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return removed;
};
goog.events.ListenerMap.prototype.removeAll = function(opt_type) {
  var typeStr = opt_type && opt_type.toString();
  var count = 0;
  for (var type in this.listeners) {
    if (!typeStr || type == typeStr) {
      var listenerArray = this.listeners[type];
      for (var i = 0;i < listenerArray.length;i++) {
        ++count;
        listenerArray[i].markAsRemoved();
      }
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return count;
};
goog.events.ListenerMap.prototype.getListeners = function(type, capture) {
  var listenerArray = this.listeners[type.toString()];
  var rv = [];
  if (listenerArray) {
    for (var i = 0;i < listenerArray.length;++i) {
      var listenerObj = listenerArray[i];
      if (listenerObj.capture == capture) {
        rv.push(listenerObj);
      }
    }
  }
  return rv;
};
goog.events.ListenerMap.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
  var listenerArray = this.listeners[type.toString()];
  var i = -1;
  if (listenerArray) {
    i = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, capture, opt_listenerScope);
  }
  return i > -1 ? listenerArray[i] : null;
};
goog.events.ListenerMap.prototype.hasListener = function(opt_type, opt_capture) {
  var hasType = goog.isDef(opt_type);
  var typeStr = hasType ? opt_type.toString() : "";
  var hasCapture = goog.isDef(opt_capture);
  return goog.object.some(this.listeners, function(listenerArray, type) {
    for (var i = 0;i < listenerArray.length;++i) {
      if ((!hasType || listenerArray[i].type == typeStr) && (!hasCapture || listenerArray[i].capture == opt_capture)) {
        return true;
      }
    }
    return false;
  });
};
goog.events.ListenerMap.findListenerIndex_ = function(listenerArray, listener, opt_useCapture, opt_listenerScope) {
  for (var i = 0;i < listenerArray.length;++i) {
    var listenerObj = listenerArray[i];
    if (!listenerObj.removed && listenerObj.listener == listener && listenerObj.capture == !!opt_useCapture && listenerObj.handler == opt_listenerScope) {
      return i;
    }
  }
  return -1;
};
goog.provide("goog.events");
goog.provide("goog.events.CaptureSimulationMode");
goog.provide("goog.events.Key");
goog.provide("goog.events.ListenableType");
goog.require("goog.asserts");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Listenable");
goog.require("goog.events.ListenerMap");
goog.forwardDeclare("goog.debug.ErrorHandler");
goog.forwardDeclare("goog.events.EventWrapper");
goog.events.Key;
goog.events.ListenableType;
goog.events.LISTENER_MAP_PROP_ = "closure_lm_" + (Math.random() * 1E6 | 0);
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.CaptureSimulationMode = {OFF_AND_FAIL:0, OFF_AND_SILENT:1, ON:2};
goog.define("goog.events.CAPTURE_SIMULATION_MODE", 2);
goog.events.listenerCountEstimate_ = 0;
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }
  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listen((type), listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_((src), (type), listener, false, opt_capt, opt_handler);
  }
};
goog.events.listen_ = function(src, type, listener, callOnce, opt_capt, opt_handler) {
  if (!type) {
    throw Error("Invalid event type");
  }
  var capture = !!opt_capt;
  if (capture && !goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    if (goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.OFF_AND_FAIL) {
      goog.asserts.fail("Can not register capture listener in IE8-.");
      return null;
    } else {
      if (goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.OFF_AND_SILENT) {
        return null;
      }
    }
  }
  var listenerMap = goog.events.getListenerMap_(src);
  if (!listenerMap) {
    src[goog.events.LISTENER_MAP_PROP_] = listenerMap = new goog.events.ListenerMap(src);
  }
  var listenerObj = listenerMap.add(type, listener, callOnce, opt_capt, opt_handler);
  if (listenerObj.proxy) {
    return listenerObj;
  }
  var proxy = goog.events.getProxy();
  listenerObj.proxy = proxy;
  proxy.src = src;
  proxy.listener = listenerObj;
  if (src.addEventListener) {
    src.addEventListener(type.toString(), proxy, capture);
  } else {
    if (src.attachEvent) {
      src.attachEvent(goog.events.getOnString_(type.toString()), proxy);
    } else {
      throw Error("addEventListener and attachEvent are unavailable.");
    }
  }
  goog.events.listenerCountEstimate_++;
  return listenerObj;
};
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ? function(eventObject) {
    return proxyCallbackFunction.call(f.src, f.listener, eventObject);
  } : function(eventObject) {
    var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
    if (!v) {
      return v;
    }
  };
  return f;
};
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }
  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listenOnce((type), listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_((src), (type), listener, true, opt_capt, opt_handler);
  }
};
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }
  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten((type), listener, opt_capt, opt_handler);
  }
  if (!src) {
    return false;
  }
  var capture = !!opt_capt;
  var listenerMap = goog.events.getListenerMap_((src));
  if (listenerMap) {
    var listenerObj = listenerMap.getListener((type), listener, capture, opt_handler);
    if (listenerObj) {
      return goog.events.unlistenByKey(listenerObj);
    }
  }
  return false;
};
goog.events.unlistenByKey = function(key) {
  if (goog.isNumber(key)) {
    return false;
  }
  var listener = key;
  if (!listener || listener.removed) {
    return false;
  }
  var src = listener.src;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return (src).unlistenByKey(listener);
  }
  var type = listener.type;
  var proxy = listener.proxy;
  if (src.removeEventListener) {
    src.removeEventListener(type, proxy, listener.capture);
  } else {
    if (src.detachEvent) {
      src.detachEvent(goog.events.getOnString_(type), proxy);
    }
  }
  goog.events.listenerCountEstimate_--;
  var listenerMap = goog.events.getListenerMap_((src));
  if (listenerMap) {
    listenerMap.removeByKey(listener);
    if (listenerMap.getTypeCount() == 0) {
      listenerMap.src = null;
      src[goog.events.LISTENER_MAP_PROP_] = null;
    }
  } else {
    listener.markAsRemoved();
  }
  return true;
};
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};
goog.events.removeAll = function(obj, opt_type) {
  if (!obj) {
    return 0;
  }
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return (obj).removeAllListeners(opt_type);
  }
  var listenerMap = goog.events.getListenerMap_((obj));
  if (!listenerMap) {
    return 0;
  }
  var count = 0;
  var typeStr = opt_type && opt_type.toString();
  for (var type in listenerMap.listeners) {
    if (!typeStr || type == typeStr) {
      var listeners = listenerMap.listeners[type].concat();
      for (var i = 0;i < listeners.length;++i) {
        if (goog.events.unlistenByKey(listeners[i])) {
          ++count;
        }
      }
    }
  }
  return count;
};
goog.events.getListeners = function(obj, type, capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return (obj).getListeners(type, capture);
  } else {
    if (!obj) {
      return [];
    }
    var listenerMap = goog.events.getListenerMap_((obj));
    return listenerMap ? listenerMap.getListeners(type, capture) : [];
  }
};
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  type = (type);
  listener = goog.events.wrapListener(listener);
  var capture = !!opt_capt;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener(type, listener, capture, opt_handler);
  }
  if (!src) {
    return null;
  }
  var listenerMap = goog.events.getListenerMap_((src));
  if (listenerMap) {
    return listenerMap.getListener(type, listener, capture, opt_handler);
  }
  return null;
};
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture);
  }
  var listenerMap = goog.events.getListenerMap_((obj));
  return !!listenerMap && listenerMap.hasListener(opt_type, opt_capture);
};
goog.events.expose = function(e) {
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + " = " + e[key] + " (" + e[key].id + ")");
    } else {
      str.push(key + " = " + e[key]);
    }
  }
  return str.join("\n");
};
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return (obj).fireListeners(type, capture, eventObject);
  }
  return goog.events.fireListeners_(obj, type, capture, eventObject);
};
goog.events.fireListeners_ = function(obj, type, capture, eventObject) {
  var retval = true;
  var listenerMap = goog.events.getListenerMap_((obj));
  if (listenerMap) {
    var listenerArray = listenerMap.listeners[type.toString()];
    if (listenerArray) {
      listenerArray = listenerArray.concat();
      for (var i = 0;i < listenerArray.length;i++) {
        var listener = listenerArray[i];
        if (listener && listener.capture == capture && !listener.removed) {
          var result = goog.events.fireListener(listener, eventObject);
          retval = retval && result !== false;
        }
      }
    }
  }
  return retval;
};
goog.events.fireListener = function(listener, eventObject) {
  var listenerFn = listener.listener;
  var listenerHandler = listener.handler || listener.src;
  if (listener.callOnce) {
    goog.events.unlistenByKey(listener);
  }
  return listenerFn.call(listenerHandler, eventObject);
};
goog.events.getTotalListenerCount = function() {
  return goog.events.listenerCountEstimate_;
};
goog.events.dispatchEvent = function(src, e) {
  goog.asserts.assert(goog.events.Listenable.isImplementedBy(src), "Can not use goog.events.dispatchEvent with " + "non-goog.events.Listenable instance.");
  return src.dispatchEvent(e);
};
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_);
};
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if (listener.removed) {
    return true;
  }
  if (!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt || (goog.getObjectByName("window.event"));
    var evt = new goog.events.BrowserEvent(ieEvent, this);
    var retval = true;
    if (goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.ON) {
      if (!goog.events.isMarkedIeEvent_(ieEvent)) {
        goog.events.markIeEvent_(ieEvent);
        var ancestors = [];
        for (var parent = evt.currentTarget;parent;parent = parent.parentNode) {
          ancestors.push(parent);
        }
        var type = listener.type;
        for (var i = ancestors.length - 1;!evt.propagationStopped_ && i >= 0;i--) {
          evt.currentTarget = ancestors[i];
          var result = goog.events.fireListeners_(ancestors[i], type, true, evt);
          retval = retval && result;
        }
        for (var i = 0;!evt.propagationStopped_ && i < ancestors.length;i++) {
          evt.currentTarget = ancestors[i];
          var result = goog.events.fireListeners_(ancestors[i], type, false, evt);
          retval = retval && result;
        }
      }
    } else {
      retval = goog.events.fireListener(listener, evt);
    }
    return retval;
  }
  return goog.events.fireListener(listener, new goog.events.BrowserEvent(opt_evt, this));
};
goog.events.markIeEvent_ = function(e) {
  var useReturnValue = false;
  if (e.keyCode == 0) {
    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }
  if (useReturnValue || (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function(identifier) {
  return identifier + "_" + goog.events.uniqueIdCounter_++;
};
goog.events.getListenerMap_ = function(src) {
  var listenerMap = src[goog.events.LISTENER_MAP_PROP_];
  return listenerMap instanceof goog.events.ListenerMap ? listenerMap : null;
};
goog.events.LISTENER_WRAPPER_PROP_ = "__closure_events_fn_" + (Math.random() * 1E9 >>> 0);
goog.events.wrapListener = function(listener) {
  goog.asserts.assert(listener, "Listener can not be null.");
  if (goog.isFunction(listener)) {
    return listener;
  }
  goog.asserts.assert(listener.handleEvent, "An object listener must have handleEvent method.");
  if (!listener[goog.events.LISTENER_WRAPPER_PROP_]) {
    listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
      return (listener).handleEvent(e);
    };
  }
  return listener[goog.events.LISTENER_WRAPPER_PROP_];
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_);
});
goog.provide("acgraph.events");
goog.provide("acgraph.events.EventType");
goog.require("goog.events");
acgraph.events.listen = goog.events.listen;
acgraph.events.listenOnce = goog.events.listenOnce;
acgraph.events.unlisten = goog.events.unlisten;
acgraph.events.unlistenByKey = goog.events.unlistenByKey;
acgraph.events.removeAll = goog.events.removeAll;
acgraph.events.EventType = {CLICK:"click", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", TAP:"tap", DRAG_EARLY_CANCEL:"earlycancel", DRAG_BEFORE:"beforedrag", DRAG:"drag", DRAG_START:"start", DRAG_END:"end", CONTEXTMENU:"contextmenu"};
goog.exportSymbol("acgraph.events.listen", acgraph.events.listen);
goog.exportSymbol("acgraph.events.listenOnce", acgraph.events.listenOnce);
goog.exportSymbol("acgraph.events.unlisten", acgraph.events.unlisten);
goog.exportSymbol("acgraph.events.unlistenByKey", acgraph.events.unlistenByKey);
goog.exportSymbol("acgraph.events.removeAll", acgraph.events.removeAll);
goog.exportSymbol("acgraph.events.EventType.CLICK", acgraph.events.EventType.CLICK);
goog.exportSymbol("acgraph.events.EventType.DBLCLICK", acgraph.events.EventType.DBLCLICK);
goog.exportSymbol("acgraph.events.EventType.MOUSEUP", acgraph.events.EventType.MOUSEUP);
goog.exportSymbol("acgraph.events.EventType.MOUSEDOWN", acgraph.events.EventType.MOUSEDOWN);
goog.exportSymbol("acgraph.events.EventType.MOUSEOVER", acgraph.events.EventType.MOUSEOVER);
goog.exportSymbol("acgraph.events.EventType.MOUSEOUT", acgraph.events.EventType.MOUSEOUT);
goog.exportSymbol("acgraph.events.EventType.MOUSEMOVE", acgraph.events.EventType.MOUSEMOVE);
goog.exportSymbol("acgraph.events.EventType.TOUCHSTART", acgraph.events.EventType.TOUCHSTART);
goog.exportSymbol("acgraph.events.EventType.TOUCHEND", acgraph.events.EventType.TOUCHEND);
goog.exportSymbol("acgraph.events.EventType.TOUCHCANCEL", acgraph.events.EventType.TOUCHCANCEL);
goog.exportSymbol("acgraph.events.EventType.TOUCHMOVE", acgraph.events.EventType.TOUCHMOVE);
goog.exportSymbol("acgraph.events.EventType.TAP", acgraph.events.EventType.TAP);
goog.exportSymbol("acgraph.events.EventType.DRAG", acgraph.events.EventType.DRAG);
goog.exportSymbol("acgraph.events.EventType.DRAG_START", acgraph.events.EventType.DRAG_START);
goog.exportSymbol("acgraph.events.EventType.DRAG_END", acgraph.events.EventType.DRAG_END);
goog.exportSymbol("acgraph.events.EventType.DRAG_EARLY_CANCEL", acgraph.events.EventType.DRAG_EARLY_CANCEL);
goog.exportSymbol("acgraph.events.EventType.DRAG_BEFORE", acgraph.events.EventType.DRAG_BEFORE);
goog.provide("goog.math.Size");
goog.math.Size = function(width, height) {
  this.width = width;
  this.height = height;
};
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};
if (goog.DEBUG) {
  goog.math.Size.prototype.toString = function() {
    return "(" + this.width + " x " + this.height + ")";
  };
}
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};
goog.math.Size.prototype.perimeter = function() {
  return (this.width + this.height) * 2;
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};
goog.math.Size.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.width *= sx;
  this.height *= sy;
  return this;
};
goog.math.Size.prototype.scaleToCover = function(target) {
  var s = this.aspectRatio() <= target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s);
};
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s);
};
goog.provide("goog.math");
goog.require("goog.array");
goog.require("goog.asserts");
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a);
};
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a);
};
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};
goog.math.modulo = function(a, b) {
  var r = a % b;
  return r * b < 0 ? r + b : r;
};
goog.math.lerp = function(a, b, x) {
  return a + x * (b - a);
};
goog.math.nearlyEquals = function(a, b, opt_tolerance) {
  return Math.abs(a - b) <= (opt_tolerance || 1E-6);
};
goog.math.standardAngle = function(angle) {
  return goog.math.modulo(angle, 360);
};
goog.math.standardAngleInRadians = function(angle) {
  return goog.math.modulo(angle, 2 * Math.PI);
};
goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};
goog.math.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI;
};
goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(goog.math.toRadians(degrees));
};
goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(goog.math.toRadians(degrees));
};
goog.math.angle = function(x1, y1, x2, y2) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1, x2 - x1)));
};
goog.math.angleDifference = function(startAngle, endAngle) {
  var d = goog.math.standardAngle(endAngle) - goog.math.standardAngle(startAngle);
  if (d > 180) {
    d = d - 360;
  } else {
    if (d <= -180) {
      d = 360 + d;
    }
  }
  return d;
};
goog.math.sign = Math.sign || function(x) {
  if (x > 0) {
    return 1;
  }
  if (x < 0) {
    return -1;
  }
  return x;
};
goog.math.longestCommonSubsequence = function(array1, array2, opt_compareFn, opt_collectorFn) {
  var compare = opt_compareFn || function(a, b) {
    return a == b;
  };
  var collect = opt_collectorFn || function(i1, i2) {
    return array1[i1];
  };
  var length1 = array1.length;
  var length2 = array2.length;
  var arr = [];
  for (var i = 0;i < length1 + 1;i++) {
    arr[i] = [];
    arr[i][0] = 0;
  }
  for (var j = 0;j < length2 + 1;j++) {
    arr[0][j] = 0;
  }
  for (i = 1;i <= length1;i++) {
    for (j = 1;j <= length2;j++) {
      if (compare(array1[i - 1], array2[j - 1])) {
        arr[i][j] = arr[i - 1][j - 1] + 1;
      } else {
        arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
      }
    }
  }
  var result = [];
  var i = length1, j = length2;
  while (i > 0 && j > 0) {
    if (compare(array1[i - 1], array2[j - 1])) {
      result.unshift(collect(i - 1, j - 1));
      i--;
      j--;
    } else {
      if (arr[i - 1][j] > arr[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
  }
  return result;
};
goog.math.sum = function(var_args) {
  return (goog.array.reduce(arguments, function(sum, value) {
    return sum + value;
  }, 0));
};
goog.math.average = function(var_args) {
  return goog.math.sum.apply(null, arguments) / arguments.length;
};
goog.math.sampleVariance = function(var_args) {
  var sampleSize = arguments.length;
  if (sampleSize < 2) {
    return 0;
  }
  var mean = goog.math.average.apply(null, arguments);
  var variance = goog.math.sum.apply(null, goog.array.map(arguments, function(val) {
    return Math.pow(val - mean, 2);
  })) / (sampleSize - 1);
  return variance;
};
goog.math.standardDeviation = function(var_args) {
  return Math.sqrt(goog.math.sampleVariance.apply(null, arguments));
};
goog.math.isInt = function(num) {
  return isFinite(num) && num % 1 == 0;
};
goog.math.isFiniteNumber = function(num) {
  return isFinite(num) && !isNaN(num);
};
goog.math.isNegativeZero = function(num) {
  return num == 0 && 1 / num < 0;
};
goog.math.log10Floor = function(num) {
  if (num > 0) {
    var x = Math.round(Math.log(num) * Math.LOG10E);
    return x - (parseFloat("1e" + x) > num ? 1 : 0);
  }
  return num == 0 ? -Infinity : NaN;
};
goog.math.safeFloor = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.floor(num + (opt_epsilon || 2E-15));
};
goog.math.safeCeil = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.ceil(num - (opt_epsilon || 2E-15));
};
goog.provide("goog.math.Coordinate");
goog.require("goog.math");
goog.math.Coordinate = function(opt_x, opt_y) {
  this.x = goog.isDef(opt_x) ? opt_x : 0;
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};
if (goog.DEBUG) {
  goog.math.Coordinate.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
  };
}
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};
goog.math.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};
goog.math.Coordinate.azimuth = function(a) {
  return goog.math.angle(0, 0, a.x, a.y);
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};
goog.math.Coordinate.prototype.ceil = function() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  return this;
};
goog.math.Coordinate.prototype.floor = function() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  return this;
};
goog.math.Coordinate.prototype.round = function() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  return this;
};
goog.math.Coordinate.prototype.translate = function(tx, opt_ty) {
  if (tx instanceof goog.math.Coordinate) {
    this.x += tx.x;
    this.y += tx.y;
  } else {
    this.x += Number(tx);
    if (goog.isNumber(opt_ty)) {
      this.y += opt_ty;
    }
  }
  return this;
};
goog.math.Coordinate.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.x *= sx;
  this.y *= sy;
  return this;
};
goog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {
  var center = opt_center || new goog.math.Coordinate(0, 0);
  var x = this.x;
  var y = this.y;
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;
  this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;
};
goog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {
  this.rotateRadians(goog.math.toRadians(degrees), opt_center);
};
goog.provide("goog.math.Box");
goog.require("goog.asserts");
goog.require("goog.math.Coordinate");
goog.math.Box = function(top, right, bottom, left) {
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.left = left;
};
goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x);
  for (var i = 1;i < arguments.length;i++) {
    box.expandToIncludeCoordinate(arguments[i]);
  }
  return box;
};
goog.math.Box.prototype.getWidth = function() {
  return this.right - this.left;
};
goog.math.Box.prototype.getHeight = function() {
  return this.bottom - this.top;
};
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left);
};
if (goog.DEBUG) {
  goog.math.Box.prototype.toString = function() {
    return "(" + this.top + "t, " + this.right + "r, " + this.bottom + "b, " + this.left + "l)";
  };
}
goog.math.Box.prototype.contains = function(other) {
  return goog.math.Box.contains(this, other);
};
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) {
  if (goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left;
  } else {
    this.top -= (top);
    this.right += Number(opt_right);
    this.bottom += Number(opt_bottom);
    this.left -= Number(opt_left);
  }
  return this;
};
goog.math.Box.prototype.expandToInclude = function(box) {
  this.left = Math.min(this.left, box.left);
  this.top = Math.min(this.top, box.top);
  this.right = Math.max(this.right, box.right);
  this.bottom = Math.max(this.bottom, box.bottom);
};
goog.math.Box.prototype.expandToIncludeCoordinate = function(coord) {
  this.top = Math.min(this.top, coord.y);
  this.right = Math.max(this.right, coord.x);
  this.bottom = Math.max(this.bottom, coord.y);
  this.left = Math.min(this.left, coord.x);
};
goog.math.Box.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.top == b.top && a.right == b.right && a.bottom == b.bottom && a.left == b.left;
};
goog.math.Box.contains = function(box, other) {
  if (!box || !other) {
    return false;
  }
  if (other instanceof goog.math.Box) {
    return other.left >= box.left && other.right <= box.right && other.top >= box.top && other.bottom <= box.bottom;
  }
  return other.x >= box.left && other.x <= box.right && other.y >= box.top && other.y <= box.bottom;
};
goog.math.Box.relativePositionX = function(box, coord) {
  if (coord.x < box.left) {
    return coord.x - box.left;
  } else {
    if (coord.x > box.right) {
      return coord.x - box.right;
    }
  }
  return 0;
};
goog.math.Box.relativePositionY = function(box, coord) {
  if (coord.y < box.top) {
    return coord.y - box.top;
  } else {
    if (coord.y > box.bottom) {
      return coord.y - box.bottom;
    }
  }
  return 0;
};
goog.math.Box.distance = function(box, coord) {
  var x = goog.math.Box.relativePositionX(box, coord);
  var y = goog.math.Box.relativePositionY(box, coord);
  return Math.sqrt(x * x + y * y);
};
goog.math.Box.intersects = function(a, b) {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
};
goog.math.Box.intersectsWithPadding = function(a, b, padding) {
  return a.left <= b.right + padding && b.left <= a.right + padding && a.top <= b.bottom + padding && b.top <= a.bottom + padding;
};
goog.math.Box.prototype.ceil = function() {
  this.top = Math.ceil(this.top);
  this.right = Math.ceil(this.right);
  this.bottom = Math.ceil(this.bottom);
  this.left = Math.ceil(this.left);
  return this;
};
goog.math.Box.prototype.floor = function() {
  this.top = Math.floor(this.top);
  this.right = Math.floor(this.right);
  this.bottom = Math.floor(this.bottom);
  this.left = Math.floor(this.left);
  return this;
};
goog.math.Box.prototype.round = function() {
  this.top = Math.round(this.top);
  this.right = Math.round(this.right);
  this.bottom = Math.round(this.bottom);
  this.left = Math.round(this.left);
  return this;
};
goog.math.Box.prototype.translate = function(tx, opt_ty) {
  if (tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.right += tx.x;
    this.top += tx.y;
    this.bottom += tx.y;
  } else {
    goog.asserts.assertNumber(tx);
    this.left += tx;
    this.right += tx;
    if (goog.isNumber(opt_ty)) {
      this.top += opt_ty;
      this.bottom += opt_ty;
    }
  }
  return this;
};
goog.math.Box.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.right *= sx;
  this.top *= sy;
  this.bottom *= sy;
  return this;
};
goog.provide("goog.math.Rect");
goog.require("goog.asserts");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.math.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h;
};
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height);
};
goog.math.Rect.prototype.toBox = function() {
  var right = this.left + this.width;
  var bottom = this.top + this.height;
  return new goog.math.Box(this.top, right, bottom, this.left);
};
goog.math.Rect.createFromPositionAndSize = function(position, size) {
  return new goog.math.Rect(position.x, position.y, size.width, size.height);
};
goog.math.Rect.createFromBox = function(box) {
  return new goog.math.Rect(box.left, box.top, box.right - box.left, box.bottom - box.top);
};
if (goog.DEBUG) {
  goog.math.Rect.prototype.toString = function() {
    return "(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)";
  };
}
goog.math.Rect.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.left == b.left && a.width == b.width && a.top == b.top && a.height == b.height;
};
goog.math.Rect.prototype.intersection = function(rect) {
  var x0 = Math.max(this.left, rect.left);
  var x1 = Math.min(this.left + this.width, rect.left + rect.width);
  if (x0 <= x1) {
    var y0 = Math.max(this.top, rect.top);
    var y1 = Math.min(this.top + this.height, rect.top + rect.height);
    if (y0 <= y1) {
      this.left = x0;
      this.top = y0;
      this.width = x1 - x0;
      this.height = y1 - y0;
      return true;
    }
  }
  return false;
};
goog.math.Rect.intersection = function(a, b) {
  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);
  if (x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);
    if (y0 <= y1) {
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0);
    }
  }
  return null;
};
goog.math.Rect.intersects = function(a, b) {
  return a.left <= b.left + b.width && b.left <= a.left + a.width && a.top <= b.top + b.height && b.top <= a.top + a.height;
};
goog.math.Rect.prototype.intersects = function(rect) {
  return goog.math.Rect.intersects(this, rect);
};
goog.math.Rect.difference = function(a, b) {
  var intersection = goog.math.Rect.intersection(a, b);
  if (!intersection || !intersection.height || !intersection.width) {
    return [a.clone()];
  }
  var result = [];
  var top = a.top;
  var height = a.height;
  var ar = a.left + a.width;
  var ab = a.top + a.height;
  var br = b.left + b.width;
  var bb = b.top + b.height;
  if (b.top > a.top) {
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    top = b.top;
    height -= b.top - a.top;
  }
  if (bb < ab) {
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb));
    height = bb - top;
  }
  if (b.left > a.left) {
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height));
  }
  if (br < ar) {
    result.push(new goog.math.Rect(br, top, ar - br, height));
  }
  return result;
};
goog.math.Rect.prototype.difference = function(rect) {
  return goog.math.Rect.difference(this, rect);
};
goog.math.Rect.prototype.boundingRect = function(rect) {
  var right = Math.max(this.left + this.width, rect.left + rect.width);
  var bottom = Math.max(this.top + this.height, rect.top + rect.height);
  this.left = Math.min(this.left, rect.left);
  this.top = Math.min(this.top, rect.top);
  this.width = right - this.left;
  this.height = bottom - this.top;
};
goog.math.Rect.boundingRect = function(a, b) {
  if (!a || !b) {
    return null;
  }
  var clone = a.clone();
  clone.boundingRect(b);
  return clone;
};
goog.math.Rect.prototype.contains = function(another) {
  if (another instanceof goog.math.Rect) {
    return this.left <= another.left && this.left + this.width >= another.left + another.width && this.top <= another.top && this.top + this.height >= another.top + another.height;
  } else {
    return another.x >= this.left && another.x <= this.left + this.width && another.y >= this.top && another.y <= this.top + this.height;
  }
};
goog.math.Rect.prototype.squaredDistance = function(point) {
  var dx = point.x < this.left ? this.left - point.x : Math.max(point.x - (this.left + this.width), 0);
  var dy = point.y < this.top ? this.top - point.y : Math.max(point.y - (this.top + this.height), 0);
  return dx * dx + dy * dy;
};
goog.math.Rect.prototype.distance = function(point) {
  return Math.sqrt(this.squaredDistance(point));
};
goog.math.Rect.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height);
};
goog.math.Rect.prototype.getTopLeft = function() {
  return new goog.math.Coordinate(this.left, this.top);
};
goog.math.Rect.prototype.getCenter = function() {
  return new goog.math.Coordinate(this.left + this.width / 2, this.top + this.height / 2);
};
goog.math.Rect.prototype.getBottomRight = function() {
  return new goog.math.Coordinate(this.left + this.width, this.top + this.height);
};
goog.math.Rect.prototype.ceil = function() {
  this.left = Math.ceil(this.left);
  this.top = Math.ceil(this.top);
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};
goog.math.Rect.prototype.floor = function() {
  this.left = Math.floor(this.left);
  this.top = Math.floor(this.top);
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};
goog.math.Rect.prototype.round = function() {
  this.left = Math.round(this.left);
  this.top = Math.round(this.top);
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};
goog.math.Rect.prototype.translate = function(tx, opt_ty) {
  if (tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.top += tx.y;
  } else {
    this.left += goog.asserts.assertNumber(tx);
    if (goog.isNumber(opt_ty)) {
      this.top += opt_ty;
    }
  }
  return this;
};
goog.math.Rect.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.width *= sx;
  this.top *= sy;
  this.height *= sy;
  return this;
};
goog.provide("acgraph.math.Rect");
goog.require("goog.math.Rect");
acgraph.math.Rect = goog.math.Rect;
acgraph.math.Rect.prototype.getLeft = function() {
  return this.left;
};
acgraph.math.Rect.prototype.getTop = function() {
  return this.top;
};
acgraph.math.Rect.prototype.getWidth = function() {
  return this.width;
};
acgraph.math.Rect.prototype.getHeight = function() {
  return this.height;
};
acgraph.math.Rect.prototype.getRight = function() {
  return this.left + this.width;
};
acgraph.math.Rect.prototype.getBottom = function() {
  return this.top + this.height;
};
acgraph.math.Rect.prototype.left;
acgraph.math.Rect.prototype.top;
acgraph.math.Rect.prototype.width;
acgraph.math.Rect.prototype.height;
acgraph.math.Rect.equals = goog.math.Rect.equals;
acgraph.math.Rect.prototype.boundingRect;
acgraph.math.Rect.prototype.clone;
acgraph.math.Rect.prototype.getSize;
acgraph.math.Rect.prototype.toString = function() {
  return "(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)";
};
goog.exportSymbol("acgraph.math.Rect", acgraph.math.Rect);
acgraph.math.Rect.prototype["getLeft"] = acgraph.math.Rect.prototype.getLeft;
acgraph.math.Rect.prototype["getTop"] = acgraph.math.Rect.prototype.getTop;
acgraph.math.Rect.prototype["getWidth"] = acgraph.math.Rect.prototype.getWidth;
acgraph.math.Rect.prototype["getHeight"] = acgraph.math.Rect.prototype.getHeight;
acgraph.math.Rect.prototype["getRight"] = acgraph.math.Rect.prototype.getRight;
acgraph.math.Rect.prototype["getBottom"] = acgraph.math.Rect.prototype.getBottom;
goog.provide("goog.dom.TagName");
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", ARTICLE:"ARTICLE", ASIDE:"ASIDE", AUDIO:"AUDIO", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDI:"BDI", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", COMMAND:"COMMAND", DATA:"DATA", DATALIST:"DATALIST", DD:"DD", DEL:"DEL", DETAILS:"DETAILS", DFN:"DFN", 
DIALOG:"DIALOG", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", EMBED:"EMBED", FIELDSET:"FIELDSET", FIGCAPTION:"FIGCAPTION", FIGURE:"FIGURE", FONT:"FONT", FOOTER:"FOOTER", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HEADER:"HEADER", HGROUP:"HGROUP", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", KEYGEN:"KEYGEN", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", 
MAP:"MAP", MARK:"MARK", MATH:"MATH", MENU:"MENU", META:"META", METER:"METER", NAV:"NAV", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", OUTPUT:"OUTPUT", P:"P", PARAM:"PARAM", PRE:"PRE", PROGRESS:"PROGRESS", Q:"Q", RP:"RP", RT:"RT", RUBY:"RUBY", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SECTION:"SECTION", SELECT:"SELECT", SMALL:"SMALL", SOURCE:"SOURCE", SPAN:"SPAN", STRIKE:"STRIKE", STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUMMARY:"SUMMARY", 
SUP:"SUP", SVG:"SVG", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEMPLATE:"TEMPLATE", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TIME:"TIME", TITLE:"TITLE", TR:"TR", TRACK:"TRACK", TT:"TT", U:"U", UL:"UL", VAR:"VAR", VIDEO:"VIDEO", WBR:"WBR"};
goog.provide("goog.i18n.bidi");
goog.provide("goog.i18n.bidi.Dir");
goog.provide("goog.i18n.bidi.DirectionalString");
goog.provide("goog.i18n.bidi.Format");
goog.define("goog.i18n.bidi.FORCE_RTL", false);
goog.i18n.bidi.IS_RTL = goog.i18n.bidi.FORCE_RTL || (goog.LOCALE.substring(0, 2).toLowerCase() == "ar" || goog.LOCALE.substring(0, 2).toLowerCase() == "fa" || goog.LOCALE.substring(0, 2).toLowerCase() == "he" || goog.LOCALE.substring(0, 2).toLowerCase() == "iw" || goog.LOCALE.substring(0, 2).toLowerCase() == "ps" || goog.LOCALE.substring(0, 2).toLowerCase() == "sd" || goog.LOCALE.substring(0, 2).toLowerCase() == "ug" || goog.LOCALE.substring(0, 2).toLowerCase() == "ur" || goog.LOCALE.substring(0, 
2).toLowerCase() == "yi") && (goog.LOCALE.length == 2 || goog.LOCALE.substring(2, 3) == "-" || goog.LOCALE.substring(2, 3) == "_") || goog.LOCALE.length >= 3 && goog.LOCALE.substring(0, 3).toLowerCase() == "ckb" && (goog.LOCALE.length == 3 || goog.LOCALE.substring(3, 4) == "-" || goog.LOCALE.substring(3, 4) == "_");
goog.i18n.bidi.Format = {LRE:"‪", RLE:"‫", PDF:"‬", LRM:"‎", RLM:"‏"};
goog.i18n.bidi.Dir = {LTR:1, RTL:-1, NEUTRAL:0};
goog.i18n.bidi.RIGHT = "right";
goog.i18n.bidi.LEFT = "left";
goog.i18n.bidi.I18N_RIGHT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.LEFT : goog.i18n.bidi.RIGHT;
goog.i18n.bidi.I18N_LEFT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;
goog.i18n.bidi.toDir = function(givenDir, opt_noNeutral) {
  if (typeof givenDir == "number") {
    return givenDir > 0 ? goog.i18n.bidi.Dir.LTR : givenDir < 0 ? goog.i18n.bidi.Dir.RTL : opt_noNeutral ? null : goog.i18n.bidi.Dir.NEUTRAL;
  } else {
    if (givenDir == null) {
      return null;
    } else {
      return givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
    }
  }
};
goog.i18n.bidi.ltrChars_ = "A-Za-zÀ-ÖØ-öø-ʸ̀-֐ࠀ-῿" + "‎Ⰰ-﬜︀-﹯﻽-￿";
goog.i18n.bidi.rtlChars_ = "֑-ۯۺ-߿‏יִ-﷿ﹰ-ﻼ";
goog.i18n.bidi.htmlSkipReg_ = /<[^>]*>|&[^;]+;/g;
goog.i18n.bidi.stripHtmlIfNeeded_ = function(str, opt_isStripNeeded) {
  return opt_isStripNeeded ? str.replace(goog.i18n.bidi.htmlSkipReg_, "") : str;
};
goog.i18n.bidi.rtlCharReg_ = new RegExp("[" + goog.i18n.bidi.rtlChars_ + "]");
goog.i18n.bidi.ltrCharReg_ = new RegExp("[" + goog.i18n.bidi.ltrChars_ + "]");
goog.i18n.bidi.hasAnyRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.hasRtlChar = goog.i18n.bidi.hasAnyRtl;
goog.i18n.bidi.hasAnyLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.ltrRe_ = new RegExp("^[" + goog.i18n.bidi.ltrChars_ + "]");
goog.i18n.bidi.rtlRe_ = new RegExp("^[" + goog.i18n.bidi.rtlChars_ + "]");
goog.i18n.bidi.isRtlChar = function(str) {
  return goog.i18n.bidi.rtlRe_.test(str);
};
goog.i18n.bidi.isLtrChar = function(str) {
  return goog.i18n.bidi.ltrRe_.test(str);
};
goog.i18n.bidi.isNeutralChar = function(str) {
  return !goog.i18n.bidi.isLtrChar(str) && !goog.i18n.bidi.isRtlChar(str);
};
goog.i18n.bidi.ltrDirCheckRe_ = new RegExp("^[^" + goog.i18n.bidi.rtlChars_ + "]*[" + goog.i18n.bidi.ltrChars_ + "]");
goog.i18n.bidi.rtlDirCheckRe_ = new RegExp("^[^" + goog.i18n.bidi.ltrChars_ + "]*[" + goog.i18n.bidi.rtlChars_ + "]");
goog.i18n.bidi.startsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isRtlText = goog.i18n.bidi.startsWithRtl;
goog.i18n.bidi.startsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isLtrText = goog.i18n.bidi.startsWithLtr;
goog.i18n.bidi.isRequiredLtrRe_ = /^http:\/\/.*/;
goog.i18n.bidi.isNeutralText = function(str, opt_isHtml) {
  str = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml);
  return goog.i18n.bidi.isRequiredLtrRe_.test(str) || !goog.i18n.bidi.hasAnyLtr(str) && !goog.i18n.bidi.hasAnyRtl(str);
};
goog.i18n.bidi.ltrExitDirCheckRe_ = new RegExp("[" + goog.i18n.bidi.ltrChars_ + "][^" + goog.i18n.bidi.rtlChars_ + "]*$");
goog.i18n.bidi.rtlExitDirCheckRe_ = new RegExp("[" + goog.i18n.bidi.rtlChars_ + "][^" + goog.i18n.bidi.ltrChars_ + "]*$");
goog.i18n.bidi.endsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isLtrExitText = goog.i18n.bidi.endsWithLtr;
goog.i18n.bidi.endsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isRtlExitText = goog.i18n.bidi.endsWithRtl;
goog.i18n.bidi.rtlLocalesRe_ = new RegExp("^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|" + ".*[-_](Arab|Hebr|Thaa|Nkoo|Tfng))" + "(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)", "i");
goog.i18n.bidi.isRtlLanguage = function(lang) {
  return goog.i18n.bidi.rtlLocalesRe_.test(lang);
};
goog.i18n.bidi.bracketGuardTextRe_ = /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(<.*?>+)/g;
goog.i18n.bidi.guardBracketInText = function(s, opt_isRtlContext) {
  var useRtl = opt_isRtlContext === undefined ? goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext;
  var mark = useRtl ? goog.i18n.bidi.Format.RLM : goog.i18n.bidi.Format.LRM;
  return s.replace(goog.i18n.bidi.bracketGuardTextRe_, mark + "$&" + mark);
};
goog.i18n.bidi.enforceRtlInHtml = function(html) {
  if (html.charAt(0) == "<") {
    return html.replace(/<\w+/, "$& dir=rtl");
  }
  return "\n<span dir=rtl>" + html + "</span>";
};
goog.i18n.bidi.enforceRtlInText = function(text) {
  return goog.i18n.bidi.Format.RLE + text + goog.i18n.bidi.Format.PDF;
};
goog.i18n.bidi.enforceLtrInHtml = function(html) {
  if (html.charAt(0) == "<") {
    return html.replace(/<\w+/, "$& dir=ltr");
  }
  return "\n<span dir=ltr>" + html + "</span>";
};
goog.i18n.bidi.enforceLtrInText = function(text) {
  return goog.i18n.bidi.Format.LRE + text + goog.i18n.bidi.Format.PDF;
};
goog.i18n.bidi.dimensionsRe_ = /:\s*([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)/g;
goog.i18n.bidi.leftRe_ = /left/gi;
goog.i18n.bidi.rightRe_ = /right/gi;
goog.i18n.bidi.tempRe_ = /%%%%/g;
goog.i18n.bidi.mirrorCSS = function(cssStr) {
  return cssStr.replace(goog.i18n.bidi.dimensionsRe_, ":$1 $4 $3 $2").replace(goog.i18n.bidi.leftRe_, "%%%%").replace(goog.i18n.bidi.rightRe_, goog.i18n.bidi.LEFT).replace(goog.i18n.bidi.tempRe_, goog.i18n.bidi.RIGHT);
};
goog.i18n.bidi.doubleQuoteSubstituteRe_ = /([\u0591-\u05f2])"/g;
goog.i18n.bidi.singleQuoteSubstituteRe_ = /([\u0591-\u05f2])'/g;
goog.i18n.bidi.normalizeHebrewQuote = function(str) {
  return str.replace(goog.i18n.bidi.doubleQuoteSubstituteRe_, "$1״").replace(goog.i18n.bidi.singleQuoteSubstituteRe_, "$1׳");
};
goog.i18n.bidi.wordSeparatorRe_ = /\s+/;
goog.i18n.bidi.hasNumeralsRe_ = /[\d\u06f0-\u06f9]/;
goog.i18n.bidi.rtlDetectionThreshold_ = .4;
goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) {
  var rtlCount = 0;
  var totalCount = 0;
  var hasWeaklyLtr = false;
  var tokens = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml).split(goog.i18n.bidi.wordSeparatorRe_);
  for (var i = 0;i < tokens.length;i++) {
    var token = tokens[i];
    if (goog.i18n.bidi.startsWithRtl(token)) {
      rtlCount++;
      totalCount++;
    } else {
      if (goog.i18n.bidi.isRequiredLtrRe_.test(token)) {
        hasWeaklyLtr = true;
      } else {
        if (goog.i18n.bidi.hasAnyLtr(token)) {
          totalCount++;
        } else {
          if (goog.i18n.bidi.hasNumeralsRe_.test(token)) {
            hasWeaklyLtr = true;
          }
        }
      }
    }
  }
  return totalCount == 0 ? hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR : goog.i18n.bidi.Dir.NEUTRAL : rtlCount / totalCount > goog.i18n.bidi.rtlDetectionThreshold_ ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
};
goog.i18n.bidi.detectRtlDirectionality = function(str, opt_isHtml) {
  return goog.i18n.bidi.estimateDirection(str, opt_isHtml) == goog.i18n.bidi.Dir.RTL;
};
goog.i18n.bidi.setElementDirAndAlign = function(element, dir) {
  if (element) {
    dir = goog.i18n.bidi.toDir(dir);
    if (dir) {
      element.style.textAlign = dir == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;
      element.dir = dir == goog.i18n.bidi.Dir.RTL ? "rtl" : "ltr";
    }
  }
};
goog.i18n.bidi.setElementDirByTextDirectionality = function(element, text) {
  switch(goog.i18n.bidi.estimateDirection(text)) {
    case goog.i18n.bidi.Dir.LTR:
      element.dir = "ltr";
      break;
    case goog.i18n.bidi.Dir.RTL:
      element.dir = "rtl";
      break;
    default:
      element.removeAttribute("dir");
  }
};
goog.i18n.bidi.DirectionalString = function() {
};
goog.i18n.bidi.DirectionalString.prototype.implementsGoogI18nBidiDirectionalString;
goog.i18n.bidi.DirectionalString.prototype.getDirection;
goog.provide("goog.fs.url");
goog.fs.url.createObjectUrl = function(blob) {
  return goog.fs.url.getUrlObject_().createObjectURL(blob);
};
goog.fs.url.revokeObjectUrl = function(url) {
  goog.fs.url.getUrlObject_().revokeObjectURL(url);
};
goog.fs.url.UrlObject_;
goog.fs.url.getUrlObject_ = function() {
  var urlObject = goog.fs.url.findUrlObject_();
  if (urlObject != null) {
    return urlObject;
  } else {
    throw Error("This browser doesn't seem to support blob URLs");
  }
};
goog.fs.url.findUrlObject_ = function() {
  if (goog.isDef(goog.global.URL) && goog.isDef(goog.global.URL.createObjectURL)) {
    return (goog.global.URL);
  } else {
    if (goog.isDef(goog.global.webkitURL) && goog.isDef(goog.global.webkitURL.createObjectURL)) {
      return (goog.global.webkitURL);
    } else {
      if (goog.isDef(goog.global.createObjectURL)) {
        return (goog.global);
      } else {
        return null;
      }
    }
  }
};
goog.fs.url.browserSupportsObjectUrls = function() {
  return goog.fs.url.findUrlObject_() != null;
};
goog.provide("goog.string.TypedString");
goog.string.TypedString = function() {
};
goog.string.TypedString.prototype.implementsGoogStringTypedString;
goog.string.TypedString.prototype.getTypedStringValue;
goog.provide("goog.string.Const");
goog.require("goog.asserts");
goog.require("goog.string.TypedString");
goog.string.Const = function() {
  this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = "";
  this.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ = goog.string.Const.TYPE_MARKER_;
};
goog.string.Const.prototype.implementsGoogStringTypedString = true;
goog.string.Const.prototype.getTypedStringValue = function() {
  return this.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
};
goog.string.Const.prototype.toString = function() {
  return "Const{" + this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ + "}";
};
goog.string.Const.unwrap = function(stringConst) {
  if (stringConst instanceof goog.string.Const && stringConst.constructor === goog.string.Const && stringConst.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ === goog.string.Const.TYPE_MARKER_) {
    return stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
  } else {
    goog.asserts.fail("expected object of type Const, got '" + stringConst + "'");
    return "type_error:Const";
  }
};
goog.string.Const.from = function(s) {
  return goog.string.Const.create__googStringSecurityPrivate_(s);
};
goog.string.Const.TYPE_MARKER_ = {};
goog.string.Const.create__googStringSecurityPrivate_ = function(s) {
  var stringConst = new goog.string.Const;
  stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = s;
  return stringConst;
};
goog.provide("goog.html.SafeUrl");
goog.require("goog.asserts");
goog.require("goog.fs.url");
goog.require("goog.i18n.bidi.Dir");
goog.require("goog.i18n.bidi.DirectionalString");
goog.require("goog.string.Const");
goog.require("goog.string.TypedString");
goog.html.SafeUrl = function() {
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = "";
  this.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeUrl.INNOCUOUS_STRING = "about:invalid#zClosurez";
goog.html.SafeUrl.prototype.implementsGoogStringTypedString = true;
goog.html.SafeUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};
goog.html.SafeUrl.prototype.implementsGoogI18nBidiDirectionalString = true;
goog.html.SafeUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};
if (goog.DEBUG) {
  goog.html.SafeUrl.prototype.toString = function() {
    return "SafeUrl{" + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ + "}";
  };
}
goog.html.SafeUrl.unwrap = function(safeUrl) {
  if (safeUrl instanceof goog.html.SafeUrl && safeUrl.constructor === goog.html.SafeUrl && safeUrl.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  } else {
    goog.asserts.fail("expected object of type SafeUrl, got '" + safeUrl + "'");
    return "type_error:SafeUrl";
  }
};
goog.html.SafeUrl.fromConstant = function(url) {
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(goog.string.Const.unwrap(url));
};
goog.html.SAFE_MIME_TYPE_PATTERN_ = /^(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm))$/i;
goog.html.SafeUrl.fromBlob = function(blob) {
  var url = goog.html.SAFE_MIME_TYPE_PATTERN_.test(blob.type) ? goog.fs.url.createObjectUrl(blob) : goog.html.SafeUrl.INNOCUOUS_STRING;
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.DATA_URL_PATTERN_ = /^data:([^;,]*);base64,[a-z0-9+\/]+=*$/i;
goog.html.SafeUrl.fromDataUrl = function(dataUrl) {
  var match = dataUrl.match(goog.html.DATA_URL_PATTERN_);
  var valid = match && goog.html.SAFE_MIME_TYPE_PATTERN_.test(match[1]);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(valid ? dataUrl : goog.html.SafeUrl.INNOCUOUS_STRING);
};
goog.html.SAFE_URL_PATTERN_ = /^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i;
goog.html.SafeUrl.sanitize = function(url) {
  if (url instanceof goog.html.SafeUrl) {
    return url;
  } else {
    if (url.implementsGoogStringTypedString) {
      url = url.getTypedStringValue();
    } else {
      url = String(url);
    }
  }
  if (!goog.html.SAFE_URL_PATTERN_.test(url)) {
    url = goog.html.SafeUrl.INNOCUOUS_STRING;
  }
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse = function(url) {
  var safeUrl = new goog.html.SafeUrl;
  safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = url;
  return safeUrl;
};
goog.html.SafeUrl.ABOUT_BLANK = goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse("about:blank");
goog.provide("goog.html.SafeStyle");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.string");
goog.require("goog.string.Const");
goog.require("goog.string.TypedString");
goog.html.SafeStyle = function() {
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = "";
  this.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeStyle.prototype.implementsGoogStringTypedString = true;
goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeStyle.fromConstant = function(style) {
  var styleString = goog.string.Const.unwrap(style);
  if (styleString.length === 0) {
    return goog.html.SafeStyle.EMPTY;
  }
  goog.html.SafeStyle.checkStyle_(styleString);
  goog.asserts.assert(goog.string.endsWith(styleString, ";"), "Last character of style string is not ';': " + styleString);
  goog.asserts.assert(goog.string.contains(styleString, ":"), "Style string must contain at least one ':', to " + 'specify a "name: value" pair: ' + styleString);
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(styleString);
};
goog.html.SafeStyle.checkStyle_ = function(style) {
  goog.asserts.assert(!/[<>]/.test(style), "Forbidden characters in style string: " + style);
};
goog.html.SafeStyle.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleWrappedValue_;
};
if (goog.DEBUG) {
  goog.html.SafeStyle.prototype.toString = function() {
    return "SafeStyle{" + this.privateDoNotAccessOrElseSafeStyleWrappedValue_ + "}";
  };
}
goog.html.SafeStyle.unwrap = function(safeStyle) {
  if (safeStyle instanceof goog.html.SafeStyle && safeStyle.constructor === goog.html.SafeStyle && safeStyle.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
  } else {
    goog.asserts.fail("expected object of type SafeStyle, got '" + safeStyle + "'");
    return "type_error:SafeStyle";
  }
};
goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse = function(style) {
  return (new goog.html.SafeStyle).initSecurityPrivateDoNotAccessOrElse_(style);
};
goog.html.SafeStyle.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(style) {
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = style;
  return this;
};
goog.html.SafeStyle.EMPTY = goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse("");
goog.html.SafeStyle.INNOCUOUS_STRING = "zClosurez";
goog.html.SafeStyle.PropertyMap;
goog.html.SafeStyle.create = function(map) {
  var style = "";
  for (var name in map) {
    if (!/^[-_a-zA-Z0-9]+$/.test(name)) {
      throw Error("Name allows only [-_a-zA-Z0-9], got: " + name);
    }
    var value = map[name];
    if (value == null) {
      continue;
    }
    if (value instanceof goog.string.Const) {
      value = goog.string.Const.unwrap(value);
      goog.asserts.assert(!/[{;}]/.test(value), "Value does not allow [{;}].");
    } else {
      if (!goog.html.SafeStyle.VALUE_RE_.test(value)) {
        goog.asserts.fail("String value allows only [-,.\"'%_!# a-zA-Z0-9], rgb() and " + "rgba(), got: " + value);
        value = goog.html.SafeStyle.INNOCUOUS_STRING;
      } else {
        if (!goog.html.SafeStyle.hasBalancedQuotes_(value)) {
          goog.asserts.fail("String value requires balanced quotes, got: " + value);
          value = goog.html.SafeStyle.INNOCUOUS_STRING;
        }
      }
    }
    style += name + ":" + value + ";";
  }
  if (!style) {
    return goog.html.SafeStyle.EMPTY;
  }
  goog.html.SafeStyle.checkStyle_(style);
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};
goog.html.SafeStyle.hasBalancedQuotes_ = function(value) {
  var outsideSingle = true;
  var outsideDouble = true;
  for (var i = 0;i < value.length;i++) {
    var c = value.charAt(i);
    if (c == "'" && outsideDouble) {
      outsideSingle = !outsideSingle;
    } else {
      if (c == '"' && outsideSingle) {
        outsideDouble = !outsideDouble;
      }
    }
  }
  return outsideSingle && outsideDouble;
};
goog.html.SafeStyle.VALUE_RE_ = /^([-,."'%_!# a-zA-Z0-9]+|(?:rgb|hsl)a?\([0-9.%, ]+\))$/;
goog.html.SafeStyle.concat = function(var_args) {
  var style = "";
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      style += goog.html.SafeStyle.unwrap(argument);
    }
  };
  goog.array.forEach(arguments, addArgument);
  if (!style) {
    return goog.html.SafeStyle.EMPTY;
  }
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};
goog.provide("goog.html.SafeStyleSheet");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.string");
goog.require("goog.string.Const");
goog.require("goog.string.TypedString");
goog.html.SafeStyleSheet = function() {
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = "";
  this.SAFE_STYLE_SHEET_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeStyleSheet.prototype.implementsGoogStringTypedString = true;
goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeStyleSheet.concat = function(var_args) {
  var result = "";
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      result += goog.html.SafeStyleSheet.unwrap(argument);
    }
  };
  goog.array.forEach(arguments, addArgument);
  return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(result);
};
goog.html.SafeStyleSheet.fromConstant = function(styleSheet) {
  var styleSheetString = goog.string.Const.unwrap(styleSheet);
  if (styleSheetString.length === 0) {
    return goog.html.SafeStyleSheet.EMPTY;
  }
  goog.asserts.assert(!goog.string.contains(styleSheetString, "<"), "Forbidden '<' character in style sheet string: " + styleSheetString);
  return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheetString);
};
goog.html.SafeStyleSheet.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
};
if (goog.DEBUG) {
  goog.html.SafeStyleSheet.prototype.toString = function() {
    return "SafeStyleSheet{" + this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ + "}";
  };
}
goog.html.SafeStyleSheet.unwrap = function(safeStyleSheet) {
  if (safeStyleSheet instanceof goog.html.SafeStyleSheet && safeStyleSheet.constructor === goog.html.SafeStyleSheet && safeStyleSheet.SAFE_STYLE_SHEET_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
  } else {
    goog.asserts.fail("expected object of type SafeStyleSheet, got '" + safeStyleSheet + "'");
    return "type_error:SafeStyleSheet";
  }
};
goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse = function(styleSheet) {
  return (new goog.html.SafeStyleSheet).initSecurityPrivateDoNotAccessOrElse_(styleSheet);
};
goog.html.SafeStyleSheet.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(styleSheet) {
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = styleSheet;
  return this;
};
goog.html.SafeStyleSheet.EMPTY = goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse("");
goog.provide("goog.html.TrustedResourceUrl");
goog.require("goog.asserts");
goog.require("goog.i18n.bidi.Dir");
goog.require("goog.i18n.bidi.DirectionalString");
goog.require("goog.string.Const");
goog.require("goog.string.TypedString");
goog.html.TrustedResourceUrl = function() {
  this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = "";
  this.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.TrustedResourceUrl.prototype.implementsGoogStringTypedString = true;
goog.html.TrustedResourceUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
};
goog.html.TrustedResourceUrl.prototype.implementsGoogI18nBidiDirectionalString = true;
goog.html.TrustedResourceUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};
if (goog.DEBUG) {
  goog.html.TrustedResourceUrl.prototype.toString = function() {
    return "TrustedResourceUrl{" + this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ + "}";
  };
}
goog.html.TrustedResourceUrl.unwrap = function(trustedResourceUrl) {
  if (trustedResourceUrl instanceof goog.html.TrustedResourceUrl && trustedResourceUrl.constructor === goog.html.TrustedResourceUrl && trustedResourceUrl.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
  } else {
    goog.asserts.fail("expected object of type TrustedResourceUrl, got '" + trustedResourceUrl + "'");
    return "type_error:TrustedResourceUrl";
  }
};
goog.html.TrustedResourceUrl.fromConstant = function(url) {
  return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(goog.string.Const.unwrap(url));
};
goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse = function(url) {
  var trustedResourceUrl = new goog.html.TrustedResourceUrl;
  trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = url;
  return trustedResourceUrl;
};
goog.provide("goog.dom.tags");
goog.require("goog.object");
goog.dom.tags.VOID_TAGS_ = goog.object.createSet("area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr");
goog.dom.tags.isVoidTag = function(tagName) {
  return goog.dom.tags.VOID_TAGS_[tagName] === true;
};
goog.provide("goog.html.SafeHtml");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom.TagName");
goog.require("goog.dom.tags");
goog.require("goog.html.SafeStyle");
goog.require("goog.html.SafeStyleSheet");
goog.require("goog.html.SafeUrl");
goog.require("goog.html.TrustedResourceUrl");
goog.require("goog.i18n.bidi.Dir");
goog.require("goog.i18n.bidi.DirectionalString");
goog.require("goog.labs.userAgent.browser");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.string.Const");
goog.require("goog.string.TypedString");
goog.html.SafeHtml = function() {
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = "";
  this.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
  this.dir_ = null;
};
goog.html.SafeHtml.prototype.implementsGoogI18nBidiDirectionalString = true;
goog.html.SafeHtml.prototype.getDirection = function() {
  return this.dir_;
};
goog.html.SafeHtml.prototype.implementsGoogStringTypedString = true;
goog.html.SafeHtml.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};
if (goog.DEBUG) {
  goog.html.SafeHtml.prototype.toString = function() {
    return "SafeHtml{" + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ + "}";
  };
}
goog.html.SafeHtml.unwrap = function(safeHtml) {
  if (safeHtml instanceof goog.html.SafeHtml && safeHtml.constructor === goog.html.SafeHtml && safeHtml.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  } else {
    goog.asserts.fail("expected object of type SafeHtml, got '" + safeHtml + "'");
    return "type_error:SafeHtml";
  }
};
goog.html.SafeHtml.TextOrHtml_;
goog.html.SafeHtml.htmlEscape = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var dir = null;
  if (textOrHtml.implementsGoogI18nBidiDirectionalString) {
    dir = textOrHtml.getDirection();
  }
  var textAsString;
  if (textOrHtml.implementsGoogStringTypedString) {
    textAsString = textOrHtml.getTypedStringValue();
  } else {
    textAsString = String(textOrHtml);
  }
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.htmlEscape(textAsString), dir);
};
goog.html.SafeHtml.htmlEscapePreservingNewlines = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.newLineToBr(goog.html.SafeHtml.unwrap(html)), html.getDirection());
};
goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.whitespaceEscape(goog.html.SafeHtml.unwrap(html)), html.getDirection());
};
goog.html.SafeHtml.from = goog.html.SafeHtml.htmlEscape;
goog.html.SafeHtml.VALID_NAMES_IN_TAG_ = /^[a-zA-Z0-9-]+$/;
goog.html.SafeHtml.URL_ATTRIBUTES_ = goog.object.createSet("action", "cite", "data", "formaction", "href", "manifest", "poster", "src");
goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_ = goog.object.createSet(goog.dom.TagName.APPLET, goog.dom.TagName.BASE, goog.dom.TagName.EMBED, goog.dom.TagName.IFRAME, goog.dom.TagName.LINK, goog.dom.TagName.MATH, goog.dom.TagName.OBJECT, goog.dom.TagName.SCRIPT, goog.dom.TagName.STYLE, goog.dom.TagName.SVG, goog.dom.TagName.TEMPLATE);
goog.html.SafeHtml.AttributeValue;
goog.html.SafeHtml.create = function(tagName, opt_attributes, opt_content) {
  if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(tagName)) {
    throw Error("Invalid tag name <" + tagName + ">.");
  }
  if (tagName.toUpperCase() in goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_) {
    throw Error("Tag name <" + tagName + "> is not allowed for SafeHtml.");
  }
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(tagName, opt_attributes, opt_content);
};
goog.html.SafeHtml.createIframe = function(opt_src, opt_srcdoc, opt_attributes, opt_content) {
  var fixedAttributes = {};
  fixedAttributes["src"] = opt_src || null;
  fixedAttributes["srcdoc"] = opt_srcdoc || null;
  var defaultAttributes = {"sandbox":""};
  var attributes = goog.html.SafeHtml.combineAttributes(fixedAttributes, defaultAttributes, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("iframe", attributes, opt_content);
};
goog.html.SafeHtml.createStyle = function(styleSheet, opt_attributes) {
  var fixedAttributes = {"type":"text/css"};
  var defaultAttributes = {};
  var attributes = goog.html.SafeHtml.combineAttributes(fixedAttributes, defaultAttributes, opt_attributes);
  var content = "";
  styleSheet = goog.array.concat(styleSheet);
  for (var i = 0;i < styleSheet.length;i++) {
    content += goog.html.SafeStyleSheet.unwrap(styleSheet[i]);
  }
  var htmlContent = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content, goog.i18n.bidi.Dir.NEUTRAL);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("style", attributes, htmlContent);
};
goog.html.SafeHtml.createMetaRefresh = function(url, opt_secs) {
  var unwrappedUrl = goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(url));
  if (goog.labs.userAgent.browser.isIE() || goog.labs.userAgent.browser.isEdge()) {
    if (goog.string.contains(unwrappedUrl, ";")) {
      unwrappedUrl = "'" + unwrappedUrl.replace(/'/g, "%27") + "'";
    }
  }
  var attributes = {"http-equiv":"refresh", "content":(opt_secs || 0) + "; url=" + unwrappedUrl};
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("meta", attributes);
};
goog.html.SafeHtml.getAttrNameAndValue_ = function(tagName, name, value) {
  if (value instanceof goog.string.Const) {
    value = goog.string.Const.unwrap(value);
  } else {
    if (name.toLowerCase() == "style") {
      value = goog.html.SafeHtml.getStyleValue_(value);
    } else {
      if (/^on/i.test(name)) {
        throw Error('Attribute "' + name + '" requires goog.string.Const value, "' + value + '" given.');
      } else {
        if (name.toLowerCase() in goog.html.SafeHtml.URL_ATTRIBUTES_) {
          if (value instanceof goog.html.TrustedResourceUrl) {
            value = goog.html.TrustedResourceUrl.unwrap(value);
          } else {
            if (value instanceof goog.html.SafeUrl) {
              value = goog.html.SafeUrl.unwrap(value);
            } else {
              if (goog.isString(value)) {
                value = goog.html.SafeUrl.sanitize(value).getTypedStringValue();
              } else {
                throw Error('Attribute "' + name + '" on tag "' + tagName + '" requires goog.html.SafeUrl, goog.string.Const, or string,' + ' value "' + value + '" given.');
              }
            }
          }
        }
      }
    }
  }
  if (value.implementsGoogStringTypedString) {
    value = value.getTypedStringValue();
  }
  goog.asserts.assert(goog.isString(value) || goog.isNumber(value), "String or number value expected, got " + typeof value + " with value: " + value);
  return name + '="' + goog.string.htmlEscape(String(value)) + '"';
};
goog.html.SafeHtml.getStyleValue_ = function(value) {
  if (!goog.isObject(value)) {
    throw Error('The "style" attribute requires goog.html.SafeStyle or map ' + "of style properties, " + typeof value + " given: " + value);
  }
  if (!(value instanceof goog.html.SafeStyle)) {
    value = goog.html.SafeStyle.create(value);
  }
  return goog.html.SafeStyle.unwrap(value);
};
goog.html.SafeHtml.createWithDir = function(dir, tagName, opt_attributes, opt_content) {
  var html = goog.html.SafeHtml.create(tagName, opt_attributes, opt_content);
  html.dir_ = dir;
  return html;
};
goog.html.SafeHtml.concat = function(var_args) {
  var dir = goog.i18n.bidi.Dir.NEUTRAL;
  var content = "";
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      var html = goog.html.SafeHtml.htmlEscape(argument);
      content += goog.html.SafeHtml.unwrap(html);
      var htmlDir = html.getDirection();
      if (dir == goog.i18n.bidi.Dir.NEUTRAL) {
        dir = htmlDir;
      } else {
        if (htmlDir != goog.i18n.bidi.Dir.NEUTRAL && dir != htmlDir) {
          dir = null;
        }
      }
    }
  };
  goog.array.forEach(arguments, addArgument);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content, dir);
};
goog.html.SafeHtml.concatWithDir = function(dir, var_args) {
  var html = goog.html.SafeHtml.concat(goog.array.slice(arguments, 1));
  html.dir_ = dir;
  return html;
};
goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse = function(html, dir) {
  return (new goog.html.SafeHtml).initSecurityPrivateDoNotAccessOrElse_(html, dir);
};
goog.html.SafeHtml.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(html, dir) {
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = html;
  this.dir_ = dir;
  return this;
};
goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse = function(tagName, opt_attributes, opt_content) {
  var dir = null;
  var result = "<" + tagName;
  if (opt_attributes) {
    for (var name in opt_attributes) {
      if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(name)) {
        throw Error('Invalid attribute name "' + name + '".');
      }
      var value = opt_attributes[name];
      if (!goog.isDefAndNotNull(value)) {
        continue;
      }
      result += " " + goog.html.SafeHtml.getAttrNameAndValue_(tagName, name, value);
    }
  }
  var content = opt_content;
  if (!goog.isDefAndNotNull(content)) {
    content = [];
  } else {
    if (!goog.isArray(content)) {
      content = [content];
    }
  }
  if (goog.dom.tags.isVoidTag(tagName.toLowerCase())) {
    goog.asserts.assert(!content.length, "Void tag <" + tagName + "> does not allow content.");
    result += ">";
  } else {
    var html = goog.html.SafeHtml.concat(content);
    result += ">" + goog.html.SafeHtml.unwrap(html) + "</" + tagName + ">";
    dir = html.getDirection();
  }
  var dirAttribute = opt_attributes && opt_attributes["dir"];
  if (dirAttribute) {
    if (/^(ltr|rtl|auto)$/i.test(dirAttribute)) {
      dir = goog.i18n.bidi.Dir.NEUTRAL;
    } else {
      dir = null;
    }
  }
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(result, dir);
};
goog.html.SafeHtml.combineAttributes = function(fixedAttributes, defaultAttributes, opt_attributes) {
  var combinedAttributes = {};
  var name;
  for (name in fixedAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, "Must be lower case");
    combinedAttributes[name] = fixedAttributes[name];
  }
  for (name in defaultAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, "Must be lower case");
    combinedAttributes[name] = defaultAttributes[name];
  }
  for (name in opt_attributes) {
    var nameLower = name.toLowerCase();
    if (nameLower in fixedAttributes) {
      throw Error('Cannot override "' + nameLower + '" attribute, got "' + name + '" with value "' + opt_attributes[name] + '"');
    }
    if (nameLower in defaultAttributes) {
      delete combinedAttributes[nameLower];
    }
    combinedAttributes[name] = opt_attributes[name];
  }
  return combinedAttributes;
};
goog.html.SafeHtml.DOCTYPE_HTML = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("<!DOCTYPE html>", goog.i18n.bidi.Dir.NEUTRAL);
goog.html.SafeHtml.EMPTY = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("", goog.i18n.bidi.Dir.NEUTRAL);
goog.html.SafeHtml.BR = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("<br>", goog.i18n.bidi.Dir.NEUTRAL);
goog.provide("goog.dom.safe");
goog.provide("goog.dom.safe.InsertAdjacentHtmlPosition");
goog.require("goog.asserts");
goog.require("goog.html.SafeHtml");
goog.require("goog.html.SafeUrl");
goog.require("goog.html.TrustedResourceUrl");
goog.require("goog.string");
goog.require("goog.string.Const");
goog.dom.safe.InsertAdjacentHtmlPosition = {AFTERBEGIN:"afterbegin", AFTEREND:"afterend", BEFOREBEGIN:"beforebegin", BEFOREEND:"beforeend"};
goog.dom.safe.insertAdjacentHtml = function(node, position, html) {
  node.insertAdjacentHTML(position, goog.html.SafeHtml.unwrap(html));
};
goog.dom.safe.setInnerHtml = function(elem, html) {
  elem.innerHTML = goog.html.SafeHtml.unwrap(html);
};
goog.dom.safe.setOuterHtml = function(elem, html) {
  elem.outerHTML = goog.html.SafeHtml.unwrap(html);
};
goog.dom.safe.documentWrite = function(doc, html) {
  doc.write(goog.html.SafeHtml.unwrap(html));
};
goog.dom.safe.setAnchorHref = function(anchor, url) {
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  anchor.href = goog.html.SafeUrl.unwrap(safeUrl);
};
goog.dom.safe.setImageSrc = function(imageElement, url) {
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  imageElement.src = goog.html.SafeUrl.unwrap(safeUrl);
};
goog.dom.safe.setEmbedSrc = function(embed, url) {
  embed.src = goog.html.TrustedResourceUrl.unwrap(url);
};
goog.dom.safe.setFrameSrc = function(frame, url) {
  frame.src = goog.html.TrustedResourceUrl.unwrap(url);
};
goog.dom.safe.setIframeSrc = function(iframe, url) {
  iframe.src = goog.html.TrustedResourceUrl.unwrap(url);
};
goog.dom.safe.setLinkHrefAndRel = function(link, url, rel) {
  link.rel = rel;
  if (goog.string.caseInsensitiveContains(rel, "stylesheet")) {
    goog.asserts.assert(url instanceof goog.html.TrustedResourceUrl, 'URL must be TrustedResourceUrl because "rel" contains "stylesheet"');
    link.href = goog.html.TrustedResourceUrl.unwrap(url);
  } else {
    if (url instanceof goog.html.TrustedResourceUrl) {
      link.href = goog.html.TrustedResourceUrl.unwrap(url);
    } else {
      if (url instanceof goog.html.SafeUrl) {
        link.href = goog.html.SafeUrl.unwrap(url);
      } else {
        link.href = goog.html.SafeUrl.sanitize(url).getTypedStringValue();
      }
    }
  }
};
goog.dom.safe.setObjectData = function(object, url) {
  object.data = goog.html.TrustedResourceUrl.unwrap(url);
};
goog.dom.safe.setScriptSrc = function(script, url) {
  script.src = goog.html.TrustedResourceUrl.unwrap(url);
};
goog.dom.safe.setLocationHref = function(loc, url) {
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  loc.href = goog.html.SafeUrl.unwrap(safeUrl);
};
goog.dom.safe.openInWindow = function(url, opt_openerWin, opt_name, opt_specs, opt_replace) {
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  var win = opt_openerWin || window;
  return win.open(goog.html.SafeUrl.unwrap(safeUrl), opt_name ? goog.string.Const.unwrap(opt_name) : "", opt_specs, opt_replace);
};
goog.provide("goog.dom.BrowserFeature");
goog.require("goog.userAgent");
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9) || goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9.1"), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), CAN_USE_PARENT_ELEMENT_PROPERTY:goog.userAgent.IE || goog.userAgent.OPERA || goog.userAgent.WEBKIT, 
INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE, LEGACY_IE_RANGES:goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)};
goog.provide("goog.dom");
goog.provide("goog.dom.Appendable");
goog.provide("goog.dom.DomHelper");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom.BrowserFeature");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.TagName");
goog.require("goog.dom.safe");
goog.require("goog.html.SafeHtml");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.string.Unicode");
goog.require("goog.userAgent");
goog.define("goog.dom.ASSUME_QUIRKS_MODE", false);
goog.define("goog.dom.ASSUME_STANDARDS_MODE", false);
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper);
};
goog.dom.defaultDomHelper_;
goog.dom.getDocument = function() {
  return document;
};
goog.dom.getElement = function(element) {
  return goog.dom.getElementHelper_(document, element);
};
goog.dom.getElementHelper_ = function(doc, element) {
  return goog.isString(element) ? doc.getElementById(element) : element;
};
goog.dom.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(document, id);
};
goog.dom.getRequiredElementHelper_ = function(doc, id) {
  goog.asserts.assertString(id);
  var element = goog.dom.getElementHelper_(doc, id);
  element = goog.asserts.assertElement(element, "No element found with id: " + id);
  return element;
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el);
};
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if (goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll("." + className);
  }
  return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el);
};
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if (parent.getElementsByClassName) {
    retVal = parent.getElementsByClassName(className)[0];
  } else {
    if (goog.dom.canUseQuerySelector_(parent)) {
      retVal = parent.querySelector("." + className);
    } else {
      retVal = goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)[0];
    }
  }
  return retVal || null;
};
goog.dom.getRequiredElementByClass = function(className, opt_root) {
  var retValue = goog.dom.getElementByClass(className, opt_root);
  return goog.asserts.assert(retValue, "No element found with className: " + className);
};
goog.dom.canUseQuerySelector_ = function(parent) {
  return !!(parent.querySelectorAll && parent.querySelector);
};
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
  var parent = opt_el || doc;
  var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
  if (goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
    var query = tagName + (opt_class ? "." + opt_class : "");
    return parent.querySelectorAll(query);
  }
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);
    if (tagName) {
      var arrayLike = {};
      var len = 0;
      for (var i = 0, el;el = els[i];i++) {
        if (tagName == el.nodeName) {
          arrayLike[len++] = el;
        }
      }
      arrayLike.length = len;
      return arrayLike;
    } else {
      return els;
    }
  }
  var els = parent.getElementsByTagName(tagName || "*");
  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el;el = els[i];i++) {
      var className = el.className;
      if (typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == "style") {
      element.style.cssText = val;
    } else {
      if (key == "class") {
        element.className = val;
      } else {
        if (key == "for") {
          element.htmlFor = val;
        } else {
          if (goog.dom.DIRECT_ATTRIBUTE_MAP_.hasOwnProperty(key)) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
          } else {
            if (goog.string.startsWith(key, "aria-") || goog.string.startsWith(key, "data-")) {
              element.setAttribute(key, val);
            } else {
              element[key] = val;
            }
          }
        }
      }
    }
  });
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {"cellpadding":"cellPadding", "cellspacing":"cellSpacing", "colspan":"colSpan", "frameborder":"frameBorder", "height":"height", "maxlength":"maxLength", "role":"role", "rowspan":"rowSpan", "type":"type", "usemap":"useMap", "valign":"vAlign", "width":"width"};
goog.dom.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize_(opt_window || window);
};
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight);
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window);
};
goog.dom.getDocumentHeightForWindow = function(win) {
  return goog.dom.getDocumentHeight_(win);
};
goog.dom.getDocumentHeight_ = function(win) {
  var doc = win.document;
  var height = 0;
  if (doc) {
    var body = doc.body;
    var docEl = (doc.documentElement);
    if (!(docEl && body)) {
      return 0;
    }
    var vh = goog.dom.getViewportSize_(win).height;
    if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight;
    } else {
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if (docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight;
      }
      if (sh > vh) {
        height = sh > oh ? sh : oh;
      } else {
        height = sh < oh ? sh : oh;
      }
    }
  }
  return height;
};
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll();
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document);
};
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher("10") && win.pageYOffset != el.scrollTop) {
    return new goog.math.Coordinate(el.scrollLeft, el.scrollTop);
  }
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop);
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document);
};
goog.dom.getDocumentScrollElement_ = function(doc) {
  if (doc.scrollingElement) {
    return doc.scrollingElement;
  }
  if (!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc)) {
    return doc.documentElement;
  }
  return doc.body || doc.documentElement;
};
goog.dom.getWindow = function(opt_doc) {
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];
  if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes && (attributes.name || attributes.type)) {
    var tagNameArr = ["<", tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
      var clone = {};
      goog.object.extend(clone, attributes);
      delete clone["type"];
      attributes = clone;
    }
    tagNameArr.push(">");
    tagName = tagNameArr.join("");
  }
  var element = doc.createElement(tagName);
  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else {
      if (goog.isArray(attributes)) {
        element.className = attributes.join(" ");
      } else {
        goog.dom.setProperties(element, attributes);
      }
    }
  }
  if (args.length > 2) {
    goog.dom.append_(doc, element, args, 2);
  }
  return element;
};
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    if (child) {
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child);
    }
  }
  for (var i = startIndex;i < args.length;i++) {
    var arg = args[i];
    if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.toArray(arg) : arg, childHandler);
    } else {
      childHandler(arg);
    }
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(name) {
  return document.createElement(name);
};
goog.dom.createTextNode = function(content) {
  return document.createTextNode(String(content));
};
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var table = (doc.createElement(goog.dom.TagName.TABLE));
  var tbody = table.appendChild(doc.createElement(goog.dom.TagName.TBODY));
  for (var i = 0;i < rows;i++) {
    var tr = doc.createElement(goog.dom.TagName.TR);
    for (var j = 0;j < columns;j++) {
      var td = doc.createElement(goog.dom.TagName.TD);
      if (fillWithNbsp) {
        goog.dom.setTextContent(td, goog.string.Unicode.NBSP);
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  return table;
};
goog.dom.safeHtmlToNode = function(html) {
  return goog.dom.safeHtmlToNode_(document, html);
};
goog.dom.safeHtmlToNode_ = function(doc, html) {
  var tempDiv = doc.createElement(goog.dom.TagName.DIV);
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    goog.dom.safe.setInnerHtml(tempDiv, goog.html.SafeHtml.concat(goog.html.SafeHtml.BR, html));
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    goog.dom.safe.setInnerHtml(tempDiv, html);
  }
  return goog.dom.childrenToNode_(doc, tempDiv);
};
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString);
};
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement(goog.dom.TagName.DIV);
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = "<br>" + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    tempDiv.innerHTML = htmlString;
  }
  return goog.dom.childrenToNode_(doc, tempDiv);
};
goog.dom.childrenToNode_ = function(doc, tempDiv) {
  if (tempDiv.childNodes.length == 1) {
    return tempDiv.removeChild(tempDiv.firstChild);
  } else {
    var fragment = doc.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document);
};
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }
  return doc.compatMode == "CSS1Compat";
};
goog.dom.canHaveChildren = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false;
  }
  switch((node).tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.COMMAND:
    ;
    case goog.dom.TagName.EMBED:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.KEYGEN:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.SOURCE:
    ;
    case goog.dom.TagName.STYLE:
    ;
    case goog.dom.TagName.TRACK:
    ;
    case goog.dom.TagName.WBR:
      return false;
  }
  return true;
};
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};
goog.dom.removeChildren = function(node) {
  var child;
  while (child = node.firstChild) {
    node.removeChild(child);
  }
};
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};
goog.dom.insertChildAt = function(parent, child, index) {
  parent.insertBefore(child, parent.childNodes[index] || null);
};
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if (element.removeNode) {
      return (element.removeNode(false));
    } else {
      while (child = element.firstChild) {
        parent.insertBefore(child, element);
      }
      return (goog.dom.removeNode(element));
    }
  }
};
goog.dom.getChildren = function(element) {
  if (goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
    return element.children;
  }
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT;
  });
};
goog.dom.getFirstElementChild = function(node) {
  if (goog.isDef(node.firstElementChild)) {
    return (node).firstElementChild;
  }
  return goog.dom.getNextElementNode_(node.firstChild, true);
};
goog.dom.getLastElementChild = function(node) {
  if (goog.isDef(node.lastElementChild)) {
    return (node).lastElementChild;
  }
  return goog.dom.getNextElementNode_(node.lastChild, false);
};
goog.dom.getNextElementSibling = function(node) {
  if (goog.isDef(node.nextElementSibling)) {
    return (node).nextElementSibling;
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};
goog.dom.getPreviousElementSibling = function(node) {
  if (goog.isDef(node.previousElementSibling)) {
    return (node).previousElementSibling;
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }
  return (node);
};
goog.dom.getNextNode = function(node) {
  if (!node) {
    return null;
  }
  if (node.firstChild) {
    return node.firstChild;
  }
  while (node && !node.nextSibling) {
    node = node.parentNode;
  }
  return node ? node.nextSibling : null;
};
goog.dom.getPreviousNode = function(node) {
  if (!node) {
    return null;
  }
  if (!node.previousSibling) {
    return node.parentNode;
  }
  node = node.previousSibling;
  while (node && node.lastChild) {
    node = node.lastChild;
  }
  return node;
};
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT;
};
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj["window"] == obj;
};
goog.dom.getParentElement = function(element) {
  var parent;
  if (goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    var isIe9 = goog.userAgent.IE && goog.userAgent.isVersionOrHigher("9") && !goog.userAgent.isVersionOrHigher("10");
    if (!(isIe9 && goog.global["SVGElement"] && element instanceof goog.global["SVGElement"])) {
      parent = element.parentElement;
      if (parent) {
        return parent;
      }
    }
  }
  parent = element.parentNode;
  return goog.dom.isElement(parent) ? (parent) : null;
};
goog.dom.contains = function(parent, descendant) {
  if (!parent || !descendant) {
    return false;
  }
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }
  if (typeof parent.compareDocumentPosition != "undefined") {
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16);
  }
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};
goog.dom.compareNodeOrder = function(node1, node2) {
  if (node1 == node2) {
    return 0;
  }
  if (node1.compareDocumentPosition) {
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    if (node1.nodeType == goog.dom.NodeType.DOCUMENT) {
      return -1;
    }
    if (node2.nodeType == goog.dom.NodeType.DOCUMENT) {
      return 1;
    }
  }
  if ("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
    if (isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex;
    } else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;
      if (parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2);
      }
      if (!isElement1 && goog.dom.contains(parent1, node2)) {
        return -1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
      }
      if (!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
      }
      return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }
  var doc = goog.dom.getOwnerDocument(node1);
  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);
  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);
  return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2);
};
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    return -1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while (s = s.previousSibling) {
    if (s == node1) {
      return -1;
    }
  }
  return 1;
};
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if (!count) {
    return null;
  } else {
    if (count == 1) {
      return arguments[0];
    }
  }
  var paths = [];
  var minLength = Infinity;
  for (i = 0;i < count;i++) {
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length);
  }
  var output = null;
  for (i = 0;i < minLength;i++) {
    var first = paths[0][i];
    for (var j = 1;j < count;j++) {
      if (first != paths[j][i]) {
        return output;
      }
    }
    output = first;
  }
  return output;
};
goog.dom.getOwnerDocument = function(node) {
  goog.asserts.assert(node, "Node cannot be null or undefined.");
  return (node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document);
};
goog.dom.getFrameContentDocument = function(frame) {
  return frame.contentDocument || (frame).contentWindow.document;
};
goog.dom.getFrameContentWindow = function(frame) {
  try {
    return frame.contentWindow || (frame.contentDocument ? goog.dom.getWindow(frame.contentDocument) : null);
  } catch (e) {
  }
  return null;
};
goog.dom.setTextContent = function(node, text) {
  goog.asserts.assert(node != null, "goog.dom.setTextContent expects a non-null value for node");
  if ("textContent" in node) {
    node.textContent = text;
  } else {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      node.data = text;
    } else {
      if (node.firstChild && node.firstChild.nodeType == goog.dom.NodeType.TEXT) {
        while (node.lastChild != node.firstChild) {
          node.removeChild(node.lastChild);
        }
        node.firstChild.data = text;
      } else {
        goog.dom.removeChildren(node);
        var doc = goog.dom.getOwnerDocument(node);
        node.appendChild(doc.createTextNode(String(text)));
      }
    }
  }
};
goog.dom.getOuterHtml = function(element) {
  goog.asserts.assert(element !== null, "goog.dom.getOuterHtml expects a non-null value for element");
  if ("outerHTML" in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement(goog.dom.TagName.DIV);
    div.appendChild(element.cloneNode(true));
    return div.innerHTML;
  }
};
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined;
};
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if (root != null) {
    var child = root.firstChild;
    while (child) {
      if (p(child)) {
        rv.push(child);
        if (findOne) {
          return true;
        }
      }
      if (goog.dom.findNodes_(child, p, rv, findOne)) {
        return true;
      }
      child = child.nextSibling;
    }
  }
  return false;
};
goog.dom.TAGS_TO_IGNORE_ = {"SCRIPT":1, "STYLE":1, "HEAD":1, "IFRAME":1, "OBJECT":1};
goog.dom.PREDEFINED_TAG_VALUES_ = {"IMG":" ", "BR":"\n"};
goog.dom.isFocusableTabIndex = function(element) {
  return goog.dom.hasSpecifiedTabIndex_(element) && goog.dom.isTabIndexFocusable_(element);
};
goog.dom.setFocusableTabIndex = function(element, enable) {
  if (enable) {
    element.tabIndex = 0;
  } else {
    element.tabIndex = -1;
    element.removeAttribute("tabIndex");
  }
};
goog.dom.isFocusable = function(element) {
  var focusable;
  if (goog.dom.nativelySupportsFocus_(element)) {
    focusable = !element.disabled && (!goog.dom.hasSpecifiedTabIndex_(element) || goog.dom.isTabIndexFocusable_(element));
  } else {
    focusable = goog.dom.isFocusableTabIndex(element);
  }
  return focusable && goog.userAgent.IE ? goog.dom.hasNonZeroBoundingRect_((element)) : focusable;
};
goog.dom.hasSpecifiedTabIndex_ = function(element) {
  var attrNode = element.getAttributeNode("tabindex");
  return goog.isDefAndNotNull(attrNode) && attrNode.specified;
};
goog.dom.isTabIndexFocusable_ = function(element) {
  var index = (element).tabIndex;
  return goog.isNumber(index) && index >= 0 && index < 32768;
};
goog.dom.nativelySupportsFocus_ = function(element) {
  return element.tagName == goog.dom.TagName.A || element.tagName == goog.dom.TagName.INPUT || element.tagName == goog.dom.TagName.TEXTAREA || element.tagName == goog.dom.TagName.SELECT || element.tagName == goog.dom.TagName.BUTTON;
};
goog.dom.hasNonZeroBoundingRect_ = function(element) {
  var rect;
  if (!goog.isFunction(element["getBoundingClientRect"]) || goog.userAgent.IE && element.parentElement == null) {
    rect = {"height":element.offsetHeight, "width":element.offsetWidth};
  } else {
    rect = element.getBoundingClientRect();
  }
  return goog.isDefAndNotNull(rect) && rect.height > 0 && rect.width > 0;
};
goog.dom.getTextContent = function(node) {
  var textContent;
  if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && node !== null && "innerText" in node) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join("");
  }
  textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  textContent = textContent.replace(/\u200B/g, "");
  if (!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, " ");
  }
  if (textContent != " ") {
    textContent = textContent.replace(/^\s*/, "");
  }
  return textContent;
};
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);
  return buf.join("");
};
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
  } else {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      if (normalizeWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""));
      } else {
        buf.push(node.nodeValue);
      }
    } else {
      if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
      } else {
        var child = node.firstChild;
        while (child) {
          goog.dom.getTextContent_(child, buf, normalizeWhitespace);
          child = child.nextSibling;
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length;
};
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while (node && node != root) {
    var cur = node;
    while (cur = cur.previousSibling) {
      buf.unshift(goog.dom.getTextContent(cur));
    }
    node = node.parentNode;
  }
  return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length;
};
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur = null;
  while (stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    } else {
      if (cur.nodeType == goog.dom.NodeType.TEXT) {
        var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
        pos += text.length;
      } else {
        if (cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length;
        } else {
          for (var i = cur.childNodes.length - 1;i >= 0;i--) {
            stack.push(cur.childNodes[i]);
          }
        }
      }
    }
  }
  if (goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur;
  }
  return cur;
};
goog.dom.isNodeList = function(val) {
  if (val && typeof val.length == "number") {
    if (goog.isObject(val)) {
      return typeof val.item == "function" || typeof val.item == "string";
    } else {
      if (goog.isFunction(val)) {
        return typeof val.item == "function";
      }
    }
  }
  return false;
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class, opt_maxSearchSteps) {
  if (!opt_tag && !opt_class) {
    return null;
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return (goog.dom.getAncestor(element, function(node) {
    return (!tagName || node.nodeName == tagName) && (!opt_class || goog.isString(node.className) && goog.array.contains(node.className.split(/\s+/), opt_class));
  }, true, opt_maxSearchSteps));
};
goog.dom.getAncestorByClass = function(element, className, opt_maxSearchSteps) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className, opt_maxSearchSteps);
};
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var steps = 0;
  while (element && (opt_maxSearchSteps == null || steps <= opt_maxSearchSteps)) {
    goog.asserts.assert(element.name != "parentNode");
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  return null;
};
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement;
  } catch (e) {
  }
  return null;
};
goog.dom.getPixelRatio = function() {
  var win = goog.dom.getWindow();
  if (goog.isDef(win.devicePixelRatio)) {
    return win.devicePixelRatio;
  } else {
    if (win.matchMedia) {
      return goog.dom.matchesPixelRatio_(.75) || goog.dom.matchesPixelRatio_(1.5) || goog.dom.matchesPixelRatio_(2) || goog.dom.matchesPixelRatio_(3) || 1;
    }
  }
  return 1;
};
goog.dom.matchesPixelRatio_ = function(pixelRatio) {
  var win = goog.dom.getWindow();
  var query = "(-webkit-min-device-pixel-ratio: " + pixelRatio + ")," + "(min--moz-device-pixel-ratio: " + pixelRatio + ")," + "(min-resolution: " + pixelRatio + "dppx)";
  return win.matchMedia(query).matches ? pixelRatio : 0;
};
goog.dom.DomHelper = function(opt_document) {
  this.document_ = opt_document || goog.global.document || document;
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};
goog.dom.DomHelper.prototype.getElement = function(element) {
  return goog.dom.getElementHelper_(this.document_, element);
};
goog.dom.DomHelper.prototype.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(this.document_, id);
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el);
};
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc);
};
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc);
};
goog.dom.DomHelper.prototype.getRequiredElementByClass = function(className, opt_root) {
  var root = opt_root || this.document_;
  return goog.dom.getRequiredElementByClass(className, root);
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow());
};
goog.dom.Appendable;
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(String(content));
};
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp);
};
goog.dom.DomHelper.prototype.safeHtmlToNode = function(html) {
  return goog.dom.safeHtmlToNode_(this.document_, html);
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_);
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_);
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_);
};
goog.dom.DomHelper.prototype.getActiveElement = function(opt_doc) {
  return goog.dom.getActiveElement(opt_doc || this.document_);
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.canHaveChildren = goog.dom.canHaveChildren;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.insertChildAt = goog.dom.insertChildAt;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getChildren = goog.dom.getChildren;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.isElement = goog.dom.isElement;
goog.dom.DomHelper.prototype.isWindow = goog.dom.isWindow;
goog.dom.DomHelper.prototype.getParentElement = goog.dom.getParentElement;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.compareNodeOrder = goog.dom.compareNodeOrder;
goog.dom.DomHelper.prototype.findCommonAncestor = goog.dom.findCommonAncestor;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.getOuterHtml = goog.dom.getOuterHtml;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.isFocusableTabIndex = goog.dom.isFocusableTabIndex;
goog.dom.DomHelper.prototype.setFocusableTabIndex = goog.dom.setFocusableTabIndex;
goog.dom.DomHelper.prototype.isFocusable = goog.dom.isFocusable;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getNodeAtOffset = goog.dom.getNodeAtOffset;
goog.dom.DomHelper.prototype.isNodeList = goog.dom.isNodeList;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
goog.provide("goog.dom.vendor");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.vendor.getVendorJsPrefix = function() {
  if (goog.userAgent.WEBKIT) {
    return "Webkit";
  } else {
    if (goog.userAgent.GECKO) {
      return "Moz";
    } else {
      if (goog.userAgent.IE) {
        return "ms";
      } else {
        if (goog.userAgent.OPERA) {
          return "O";
        }
      }
    }
  }
  return null;
};
goog.dom.vendor.getVendorPrefix = function() {
  if (goog.userAgent.WEBKIT) {
    return "-webkit";
  } else {
    if (goog.userAgent.GECKO) {
      return "-moz";
    } else {
      if (goog.userAgent.IE) {
        return "-ms";
      } else {
        if (goog.userAgent.OPERA) {
          return "-o";
        }
      }
    }
  }
  return null;
};
goog.dom.vendor.getPrefixedPropertyName = function(propertyName, opt_object) {
  if (opt_object && propertyName in opt_object) {
    return propertyName;
  }
  var prefix = goog.dom.vendor.getVendorJsPrefix();
  if (prefix) {
    prefix = prefix.toLowerCase();
    var prefixedPropertyName = prefix + goog.string.toTitleCase(propertyName);
    return !goog.isDef(opt_object) || prefixedPropertyName in opt_object ? prefixedPropertyName : null;
  }
  return null;
};
goog.dom.vendor.getPrefixedEventType = function(eventType) {
  var prefix = goog.dom.vendor.getVendorJsPrefix() || "";
  return (prefix + eventType).toLowerCase();
};
goog.provide("goog.style");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.TagName");
goog.require("goog.dom.vendor");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.reflect");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.forwardDeclare("goog.events.BrowserEvent");
goog.forwardDeclare("goog.events.Event");
goog.style.setStyle = function(element, style, opt_value) {
  if (goog.isString(style)) {
    goog.style.setStyle_(element, opt_value, style);
  } else {
    for (var key in style) {
      goog.style.setStyle_(element, style[key], key);
    }
  }
};
goog.style.setStyle_ = function(element, value, style) {
  var propertyName = goog.style.getVendorJsStyleName_(element, style);
  if (propertyName) {
    element.style[propertyName] = value;
  }
};
goog.style.styleNameCache_ = {};
goog.style.getVendorJsStyleName_ = function(element, style) {
  var propertyName = goog.style.styleNameCache_[style];
  if (!propertyName) {
    var camelStyle = goog.string.toCamelCase(style);
    propertyName = camelStyle;
    if (element.style[camelStyle] === undefined) {
      var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(camelStyle);
      if (element.style[prefixedStyle] !== undefined) {
        propertyName = prefixedStyle;
      }
    }
    goog.style.styleNameCache_[style] = propertyName;
  }
  return propertyName;
};
goog.style.getVendorStyleName_ = function(element, style) {
  var camelStyle = goog.string.toCamelCase(style);
  if (element.style[camelStyle] === undefined) {
    var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(camelStyle);
    if (element.style[prefixedStyle] !== undefined) {
      return goog.dom.vendor.getVendorPrefix() + "-" + style;
    }
  }
  return style;
};
goog.style.getStyle = function(element, property) {
  var styleValue = element.style[goog.string.toCamelCase(property)];
  if (typeof styleValue !== "undefined") {
    return styleValue;
  }
  return element.style[goog.style.getVendorJsStyleName_(element, property)] || "";
};
goog.style.getComputedStyle = function(element, property) {
  var doc = goog.dom.getOwnerDocument(element);
  if (doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(element, null);
    if (styles) {
      return styles[property] || styles.getPropertyValue(property) || "";
    }
  }
  return "";
};
goog.style.getCascadedStyle = function(element, style) {
  return element.currentStyle ? element.currentStyle[style] : null;
};
goog.style.getStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) || goog.style.getCascadedStyle(element, style) || element.style && element.style[style];
};
goog.style.getComputedBoxSizing = function(element) {
  return goog.style.getStyle_(element, "boxSizing") || goog.style.getStyle_(element, "MozBoxSizing") || goog.style.getStyle_(element, "WebkitBoxSizing") || null;
};
goog.style.getComputedPosition = function(element) {
  return goog.style.getStyle_(element, "position");
};
goog.style.getBackgroundColor = function(element) {
  return goog.style.getStyle_(element, "backgroundColor");
};
goog.style.getComputedOverflowX = function(element) {
  return goog.style.getStyle_(element, "overflowX");
};
goog.style.getComputedOverflowY = function(element) {
  return goog.style.getStyle_(element, "overflowY");
};
goog.style.getComputedZIndex = function(element) {
  return goog.style.getStyle_(element, "zIndex");
};
goog.style.getComputedTextAlign = function(element) {
  return goog.style.getStyle_(element, "textAlign");
};
goog.style.getComputedCursor = function(element) {
  return goog.style.getStyle_(element, "cursor");
};
goog.style.getComputedTransform = function(element) {
  var property = goog.style.getVendorStyleName_(element, "transform");
  return goog.style.getStyle_(element, property) || goog.style.getStyle_(element, "transform");
};
goog.style.setPosition = function(el, arg1, opt_arg2) {
  var x, y;
  if (arg1 instanceof goog.math.Coordinate) {
    x = arg1.x;
    y = arg1.y;
  } else {
    x = arg1;
    y = opt_arg2;
  }
  el.style.left = goog.style.getPixelStyleValue_((x), false);
  el.style.top = goog.style.getPixelStyleValue_((y), false);
};
goog.style.getPosition = function(element) {
  return new goog.math.Coordinate((element).offsetLeft, (element).offsetTop);
};
goog.style.getClientViewportElement = function(opt_node) {
  var doc;
  if (opt_node) {
    doc = goog.dom.getOwnerDocument(opt_node);
  } else {
    doc = goog.dom.getDocument();
  }
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9) && !goog.dom.getDomHelper(doc).isCss1CompatMode()) {
    return doc.body;
  }
  return doc.documentElement;
};
goog.style.getViewportPageOffset = function(doc) {
  var body = doc.body;
  var documentElement = doc.documentElement;
  var scrollLeft = body.scrollLeft || documentElement.scrollLeft;
  var scrollTop = body.scrollTop || documentElement.scrollTop;
  return new goog.math.Coordinate(scrollLeft, scrollTop);
};
goog.style.getBoundingClientRect_ = function(el) {
  var rect;
  try {
    rect = el.getBoundingClientRect();
  } catch (e) {
    return {"left":0, "top":0, "right":0, "bottom":0};
  }
  if (goog.userAgent.IE && el.ownerDocument.body) {
    var doc = el.ownerDocument;
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop;
  }
  return rect;
};
goog.style.getOffsetParent = function(element) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(8)) {
    goog.asserts.assert("offsetParent" in element);
    return element.offsetParent;
  }
  var doc = goog.dom.getOwnerDocument(element);
  var positionStyle = goog.style.getStyle_(element, "position");
  var skipStatic = positionStyle == "fixed" || positionStyle == "absolute";
  for (var parent = element.parentNode;parent && parent != doc;parent = parent.parentNode) {
    if (parent.nodeType == goog.dom.NodeType.DOCUMENT_FRAGMENT && parent.host) {
      parent = parent.host;
    }
    positionStyle = goog.style.getStyle_((parent), "position");
    skipStatic = skipStatic && positionStyle == "static" && parent != doc.documentElement && parent != doc.body;
    if (!skipStatic && (parent.scrollWidth > parent.clientWidth || parent.scrollHeight > parent.clientHeight || positionStyle == "fixed" || positionStyle == "absolute" || positionStyle == "relative")) {
      return (parent);
    }
  }
  return null;
};
goog.style.getVisibleRectForElement = function(element) {
  var visibleRect = new goog.math.Box(0, Infinity, Infinity, 0);
  var dom = goog.dom.getDomHelper(element);
  var body = dom.getDocument().body;
  var documentElement = dom.getDocument().documentElement;
  var scrollEl = dom.getDocumentScrollElement();
  for (var el = element;el = goog.style.getOffsetParent(el);) {
    if ((!goog.userAgent.IE || el.clientWidth != 0) && (!goog.userAgent.WEBKIT || el.clientHeight != 0 || el != body) && (el != body && el != documentElement && goog.style.getStyle_(el, "overflow") != "visible")) {
      var pos = goog.style.getPageOffset(el);
      var client = goog.style.getClientLeftTop(el);
      pos.x += client.x;
      pos.y += client.y;
      visibleRect.top = Math.max(visibleRect.top, pos.y);
      visibleRect.right = Math.min(visibleRect.right, pos.x + el.clientWidth);
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.y + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.x);
    }
  }
  var scrollX = scrollEl.scrollLeft, scrollY = scrollEl.scrollTop;
  visibleRect.left = Math.max(visibleRect.left, scrollX);
  visibleRect.top = Math.max(visibleRect.top, scrollY);
  var winSize = dom.getViewportSize();
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
  return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null;
};
goog.style.getContainerOffsetToScrollInto = function(element, opt_container, opt_center) {
  var container = opt_container || goog.dom.getDocumentScrollElement();
  var elementPos = goog.style.getPageOffset(element);
  var containerPos = goog.style.getPageOffset(container);
  var containerBorder = goog.style.getBorderBox(container);
  if (container == goog.dom.getDocumentScrollElement()) {
    var relX = elementPos.x - container.scrollLeft;
    var relY = elementPos.y - container.scrollTop;
    if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(10)) {
      relX += containerBorder.left;
      relY += containerBorder.top;
    }
  } else {
    var relX = elementPos.x - containerPos.x - containerBorder.left;
    var relY = elementPos.y - containerPos.y - containerBorder.top;
  }
  var spaceX = container.clientWidth - (element).offsetWidth;
  var spaceY = container.clientHeight - (element).offsetHeight;
  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;
  if (opt_center) {
    scrollLeft += relX - spaceX / 2;
    scrollTop += relY - spaceY / 2;
  } else {
    scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    scrollTop += Math.min(relY, Math.max(relY - spaceY, 0));
  }
  return new goog.math.Coordinate(scrollLeft, scrollTop);
};
goog.style.scrollIntoContainerView = function(element, opt_container, opt_center) {
  var container = opt_container || goog.dom.getDocumentScrollElement();
  var offset = goog.style.getContainerOffsetToScrollInto(element, container, opt_center);
  container.scrollLeft = offset.x;
  container.scrollTop = offset.y;
};
goog.style.getClientLeftTop = function(el) {
  return new goog.math.Coordinate(el.clientLeft, el.clientTop);
};
goog.style.getPageOffset = function(el) {
  var doc = goog.dom.getOwnerDocument(el);
  goog.asserts.assertObject(el, "Parameter is required");
  var pos = new goog.math.Coordinate(0, 0);
  var viewportElement = goog.style.getClientViewportElement(doc);
  if (el == viewportElement) {
    return pos;
  }
  var box = goog.style.getBoundingClientRect_(el);
  var scrollCoord = goog.dom.getDomHelper(doc).getDocumentScroll();
  pos.x = box.left + scrollCoord.x;
  pos.y = box.top + scrollCoord.y;
  return pos;
};
goog.style.getPageOffsetLeft = function(el) {
  return goog.style.getPageOffset(el).x;
};
goog.style.getPageOffsetTop = function(el) {
  return goog.style.getPageOffset(el).y;
};
goog.style.getFramedPageOffset = function(el, relativeWin) {
  var position = new goog.math.Coordinate(0, 0);
  var currentWin = goog.dom.getWindow(goog.dom.getOwnerDocument(el));
  if (!goog.reflect.canAccessProperty(currentWin, "parent")) {
    return position;
  }
  var currentEl = el;
  do {
    var offset = currentWin == relativeWin ? goog.style.getPageOffset(currentEl) : goog.style.getClientPositionForElement_(goog.asserts.assert(currentEl));
    position.x += offset.x;
    position.y += offset.y;
  } while (currentWin && currentWin != relativeWin && currentWin != currentWin.parent && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent));
  return position;
};
goog.style.translateRectForAnotherFrame = function(rect, origBase, newBase) {
  if (origBase.getDocument() != newBase.getDocument()) {
    var body = origBase.getDocument().body;
    var pos = goog.style.getFramedPageOffset(body, newBase.getWindow());
    pos = goog.math.Coordinate.difference(pos, goog.style.getPageOffset(body));
    if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9) && !origBase.isCss1CompatMode()) {
      pos = goog.math.Coordinate.difference(pos, origBase.getDocumentScroll());
    }
    rect.left += pos.x;
    rect.top += pos.y;
  }
};
goog.style.getRelativePosition = function(a, b) {
  var ap = goog.style.getClientPosition(a);
  var bp = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y);
};
goog.style.getClientPositionForElement_ = function(el) {
  var box = goog.style.getBoundingClientRect_(el);
  return new goog.math.Coordinate(box.left, box.top);
};
goog.style.getClientPosition = function(el) {
  goog.asserts.assert(el);
  if (el.nodeType == goog.dom.NodeType.ELEMENT) {
    return goog.style.getClientPositionForElement_((el));
  } else {
    var targetEvent = el.changedTouches ? el.changedTouches[0] : el;
    return new goog.math.Coordinate(targetEvent.clientX, targetEvent.clientY);
  }
};
goog.style.setPageOffset = function(el, x, opt_y) {
  var cur = goog.style.getPageOffset(el);
  if (x instanceof goog.math.Coordinate) {
    opt_y = x.y;
    x = x.x;
  }
  var dx = goog.asserts.assertNumber(x) - cur.x;
  var dy = Number(opt_y) - cur.y;
  goog.style.setPosition(el, (el).offsetLeft + dx, (el).offsetTop + dy);
};
goog.style.setSize = function(element, w, opt_h) {
  var h;
  if (w instanceof goog.math.Size) {
    h = w.height;
    w = w.width;
  } else {
    if (opt_h == undefined) {
      throw Error("missing height argument");
    }
    h = opt_h;
  }
  goog.style.setWidth(element, (w));
  goog.style.setHeight(element, h);
};
goog.style.getPixelStyleValue_ = function(value, round) {
  if (typeof value == "number") {
    value = (round ? Math.round(value) : value) + "px";
  }
  return value;
};
goog.style.setHeight = function(element, height) {
  element.style.height = goog.style.getPixelStyleValue_(height, true);
};
goog.style.setWidth = function(element, width) {
  element.style.width = goog.style.getPixelStyleValue_(width, true);
};
goog.style.getSize = function(element) {
  return goog.style.evaluateWithTemporaryDisplay_(goog.style.getSizeWithDisplay_, (element));
};
goog.style.evaluateWithTemporaryDisplay_ = function(fn, element) {
  if (goog.style.getStyle_(element, "display") != "none") {
    return fn(element);
  }
  var style = element.style;
  var originalDisplay = style.display;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;
  style.visibility = "hidden";
  style.position = "absolute";
  style.display = "inline";
  var retVal = fn(element);
  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;
  return retVal;
};
goog.style.getSizeWithDisplay_ = function(element) {
  var offsetWidth = (element).offsetWidth;
  var offsetHeight = (element).offsetHeight;
  var webkitOffsetsZero = goog.userAgent.WEBKIT && !offsetWidth && !offsetHeight;
  if ((!goog.isDef(offsetWidth) || webkitOffsetsZero) && element.getBoundingClientRect) {
    var clientRect = goog.style.getBoundingClientRect_(element);
    return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top);
  }
  return new goog.math.Size(offsetWidth, offsetHeight);
};
goog.style.getTransformedSize = function(element) {
  if (!element.getBoundingClientRect) {
    return null;
  }
  var clientRect = goog.style.evaluateWithTemporaryDisplay_(goog.style.getBoundingClientRect_, element);
  return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top);
};
goog.style.getBounds = function(element) {
  var o = goog.style.getPageOffset(element);
  var s = goog.style.getSize(element);
  return new goog.math.Rect(o.x, o.y, s.width, s.height);
};
goog.style.toCamelCase = function(selector) {
  return goog.string.toCamelCase(String(selector));
};
goog.style.toSelectorCase = function(selector) {
  return goog.string.toSelectorCase(selector);
};
goog.style.getOpacity = function(el) {
  goog.asserts.assert(el);
  var style = el.style;
  var result = "";
  if ("opacity" in style) {
    result = style.opacity;
  } else {
    if ("MozOpacity" in style) {
      result = style.MozOpacity;
    } else {
      if ("filter" in style) {
        var match = style.filter.match(/alpha\(opacity=([\d.]+)\)/);
        if (match) {
          result = String(match[1] / 100);
        }
      }
    }
  }
  return result == "" ? result : Number(result);
};
goog.style.setOpacity = function(el, alpha) {
  goog.asserts.assert(el);
  var style = el.style;
  if ("opacity" in style) {
    style.opacity = alpha;
  } else {
    if ("MozOpacity" in style) {
      style.MozOpacity = alpha;
    } else {
      if ("filter" in style) {
        if (alpha === "") {
          style.filter = "";
        } else {
          style.filter = "alpha(opacity=" + Number(alpha) * 100 + ")";
        }
      }
    }
  }
};
goog.style.setTransparentBackgroundImage = function(el, src) {
  var style = el.style;
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + 'src="' + src + '", sizingMethod="crop")';
  } else {
    style.backgroundImage = "url(" + src + ")";
    style.backgroundPosition = "top left";
    style.backgroundRepeat = "no-repeat";
  }
};
goog.style.clearTransparentBackgroundImage = function(el) {
  var style = el.style;
  if ("filter" in style) {
    style.filter = "";
  } else {
    style.backgroundImage = "none";
  }
};
goog.style.showElement = function(el, display) {
  goog.style.setElementShown(el, display);
};
goog.style.setElementShown = function(el, isShown) {
  el.style.display = isShown ? "" : "none";
};
goog.style.isElementShown = function(el) {
  return el.style.display != "none";
};
goog.style.installStyles = function(stylesString, opt_node) {
  var dh = goog.dom.getDomHelper(opt_node);
  var styleSheet = null;
  var doc = dh.getDocument();
  if (goog.userAgent.IE && doc.createStyleSheet) {
    styleSheet = doc.createStyleSheet();
    goog.style.setStyles(styleSheet, stylesString);
  } else {
    var head = dh.getElementsByTagNameAndClass(goog.dom.TagName.HEAD)[0];
    if (!head) {
      var body = dh.getElementsByTagNameAndClass(goog.dom.TagName.BODY)[0];
      head = dh.createDom(goog.dom.TagName.HEAD);
      body.parentNode.insertBefore(head, body);
    }
    styleSheet = dh.createDom(goog.dom.TagName.STYLE);
    goog.style.setStyles(styleSheet, stylesString);
    dh.appendChild(head, styleSheet);
  }
  return styleSheet;
};
goog.style.uninstallStyles = function(styleSheet) {
  var node = styleSheet.ownerNode || styleSheet.owningElement || (styleSheet);
  goog.dom.removeNode(node);
};
goog.style.setStyles = function(element, stylesString) {
  if (goog.userAgent.IE && goog.isDef(element.cssText)) {
    element.cssText = stylesString;
  } else {
    element.innerHTML = stylesString;
  }
};
goog.style.setPreWrap = function(el) {
  var style = el.style;
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.whiteSpace = "pre";
    style.wordWrap = "break-word";
  } else {
    if (goog.userAgent.GECKO) {
      style.whiteSpace = "-moz-pre-wrap";
    } else {
      style.whiteSpace = "pre-wrap";
    }
  }
};
goog.style.setInlineBlock = function(el) {
  var style = el.style;
  style.position = "relative";
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.zoom = "1";
    style.display = "inline";
  } else {
    style.display = "inline-block";
  }
};
goog.style.isRightToLeft = function(el) {
  return "rtl" == goog.style.getStyle_(el, "direction");
};
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? "MozUserSelect" : goog.userAgent.WEBKIT || goog.userAgent.EDGE ? "WebkitUserSelect" : null;
goog.style.isUnselectable = function(el) {
  if (goog.style.unselectableStyle_) {
    return el.style[goog.style.unselectableStyle_].toLowerCase() == "none";
  } else {
    if (goog.userAgent.IE || goog.userAgent.OPERA) {
      return el.getAttribute("unselectable") == "on";
    }
  }
  return false;
};
goog.style.setUnselectable = function(el, unselectable, opt_noRecurse) {
  var descendants = !opt_noRecurse ? el.getElementsByTagName("*") : null;
  var name = goog.style.unselectableStyle_;
  if (name) {
    var value = unselectable ? "none" : "";
    if (el.style) {
      el.style[name] = value;
    }
    if (descendants) {
      for (var i = 0, descendant;descendant = descendants[i];i++) {
        if (descendant.style) {
          descendant.style[name] = value;
        }
      }
    }
  } else {
    if (goog.userAgent.IE || goog.userAgent.OPERA) {
      var value = unselectable ? "on" : "";
      el.setAttribute("unselectable", value);
      if (descendants) {
        for (var i = 0, descendant;descendant = descendants[i];i++) {
          descendant.setAttribute("unselectable", value);
        }
      }
    }
  }
};
goog.style.getBorderBoxSize = function(element) {
  return new goog.math.Size((element).offsetWidth, (element).offsetHeight);
};
goog.style.setBorderBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("10") && (!isCss1CompatMode || !goog.userAgent.isVersionOrHigher("8"))) {
    var style = element.style;
    if (isCss1CompatMode) {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right;
      style.pixelHeight = size.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom;
    } else {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height;
    }
  } else {
    goog.style.setBoxSizingSize_(element, size, "border-box");
  }
};
goog.style.getContentBoxSize = function(element) {
  var doc = goog.dom.getOwnerDocument(element);
  var ieCurrentStyle = goog.userAgent.IE && element.currentStyle;
  if (ieCurrentStyle && goog.dom.getDomHelper(doc).isCss1CompatMode() && ieCurrentStyle.width != "auto" && ieCurrentStyle.height != "auto" && !ieCurrentStyle.boxSizing) {
    var width = goog.style.getIePixelValue_(element, ieCurrentStyle.width, "width", "pixelWidth");
    var height = goog.style.getIePixelValue_(element, ieCurrentStyle.height, "height", "pixelHeight");
    return new goog.math.Size(width, height);
  } else {
    var borderBoxSize = goog.style.getBorderBoxSize(element);
    var paddingBox = goog.style.getPaddingBox(element);
    var borderBox = goog.style.getBorderBox(element);
    return new goog.math.Size(borderBoxSize.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right, borderBoxSize.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom);
  }
};
goog.style.setContentBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("10") && (!isCss1CompatMode || !goog.userAgent.isVersionOrHigher("8"))) {
    var style = element.style;
    if (isCss1CompatMode) {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height;
    } else {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width + borderBox.left + paddingBox.left + paddingBox.right + borderBox.right;
      style.pixelHeight = size.height + borderBox.top + paddingBox.top + paddingBox.bottom + borderBox.bottom;
    }
  } else {
    goog.style.setBoxSizingSize_(element, size, "content-box");
  }
};
goog.style.setBoxSizingSize_ = function(element, size, boxSizing) {
  var style = element.style;
  if (goog.userAgent.GECKO) {
    style.MozBoxSizing = boxSizing;
  } else {
    if (goog.userAgent.WEBKIT) {
      style.WebkitBoxSizing = boxSizing;
    } else {
      style.boxSizing = boxSizing;
    }
  }
  style.width = Math.max(size.width, 0) + "px";
  style.height = Math.max(size.height, 0) + "px";
};
goog.style.getIePixelValue_ = function(element, value, name, pixelName) {
  if (/^\d+px?$/.test(value)) {
    return parseInt(value, 10);
  } else {
    var oldStyleValue = element.style[name];
    var oldRuntimeValue = element.runtimeStyle[name];
    element.runtimeStyle[name] = element.currentStyle[name];
    element.style[name] = value;
    var pixelValue = element.style[pixelName];
    element.style[name] = oldStyleValue;
    element.runtimeStyle[name] = oldRuntimeValue;
    return pixelValue;
  }
};
goog.style.getIePixelDistance_ = function(element, propName) {
  var value = goog.style.getCascadedStyle(element, propName);
  return value ? goog.style.getIePixelValue_(element, value, "left", "pixelLeft") : 0;
};
goog.style.getBox_ = function(element, stylePrefix) {
  if (goog.userAgent.IE) {
    var left = goog.style.getIePixelDistance_(element, stylePrefix + "Left");
    var right = goog.style.getIePixelDistance_(element, stylePrefix + "Right");
    var top = goog.style.getIePixelDistance_(element, stylePrefix + "Top");
    var bottom = goog.style.getIePixelDistance_(element, stylePrefix + "Bottom");
    return new goog.math.Box(top, right, bottom, left);
  } else {
    var left = goog.style.getComputedStyle(element, stylePrefix + "Left");
    var right = goog.style.getComputedStyle(element, stylePrefix + "Right");
    var top = goog.style.getComputedStyle(element, stylePrefix + "Top");
    var bottom = goog.style.getComputedStyle(element, stylePrefix + "Bottom");
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left));
  }
};
goog.style.getPaddingBox = function(element) {
  return goog.style.getBox_(element, "padding");
};
goog.style.getMarginBox = function(element) {
  return goog.style.getBox_(element, "margin");
};
goog.style.ieBorderWidthKeywords_ = {"thin":2, "medium":4, "thick":6};
goog.style.getIePixelBorder_ = function(element, prop) {
  if (goog.style.getCascadedStyle(element, prop + "Style") == "none") {
    return 0;
  }
  var width = goog.style.getCascadedStyle(element, prop + "Width");
  if (width in goog.style.ieBorderWidthKeywords_) {
    return goog.style.ieBorderWidthKeywords_[width];
  }
  return goog.style.getIePixelValue_(element, width, "left", "pixelLeft");
};
goog.style.getBorderBox = function(element) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    var left = goog.style.getIePixelBorder_(element, "borderLeft");
    var right = goog.style.getIePixelBorder_(element, "borderRight");
    var top = goog.style.getIePixelBorder_(element, "borderTop");
    var bottom = goog.style.getIePixelBorder_(element, "borderBottom");
    return new goog.math.Box(top, right, bottom, left);
  } else {
    var left = goog.style.getComputedStyle(element, "borderLeftWidth");
    var right = goog.style.getComputedStyle(element, "borderRightWidth");
    var top = goog.style.getComputedStyle(element, "borderTopWidth");
    var bottom = goog.style.getComputedStyle(element, "borderBottomWidth");
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left));
  }
};
goog.style.getFontFamily = function(el) {
  var doc = goog.dom.getOwnerDocument(el);
  var font = "";
  if (doc.body.createTextRange && goog.dom.contains(doc, el)) {
    var range = doc.body.createTextRange();
    range.moveToElementText(el);
    try {
      font = range.queryCommandValue("FontName");
    } catch (e) {
      font = "";
    }
  }
  if (!font) {
    font = goog.style.getStyle_(el, "fontFamily");
  }
  var fontsArray = font.split(",");
  if (fontsArray.length > 1) {
    font = fontsArray[0];
  }
  return goog.string.stripQuotes(font, "\"'");
};
goog.style.lengthUnitRegex_ = /[^\d]+$/;
goog.style.getLengthUnits = function(value) {
  var units = value.match(goog.style.lengthUnitRegex_);
  return units && units[0] || null;
};
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = {"cm":1, "in":1, "mm":1, "pc":1, "pt":1};
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = {"em":1, "ex":1};
goog.style.getFontSize = function(el) {
  var fontSize = goog.style.getStyle_(el, "fontSize");
  var sizeUnits = goog.style.getLengthUnits(fontSize);
  if (fontSize && "px" == sizeUnits) {
    return parseInt(fontSize, 10);
  }
  if (goog.userAgent.IE) {
    if (sizeUnits in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) {
      return goog.style.getIePixelValue_(el, fontSize, "left", "pixelLeft");
    } else {
      if (el.parentNode && el.parentNode.nodeType == goog.dom.NodeType.ELEMENT && sizeUnits in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_) {
        var parentElement = (el.parentNode);
        var parentSize = goog.style.getStyle_(parentElement, "fontSize");
        return goog.style.getIePixelValue_(parentElement, fontSize == parentSize ? "1em" : fontSize, "left", "pixelLeft");
      }
    }
  }
  var sizeElement = goog.dom.createDom(goog.dom.TagName.SPAN, {"style":"visibility:hidden;position:absolute;" + "line-height:0;padding:0;margin:0;border:0;height:1em;"});
  goog.dom.appendChild(el, sizeElement);
  fontSize = sizeElement.offsetHeight;
  goog.dom.removeNode(sizeElement);
  return fontSize;
};
goog.style.parseStyleAttribute = function(value) {
  var result = {};
  goog.array.forEach(value.split(/\s*;\s*/), function(pair) {
    var keyValue = pair.match(/\s*([\w-]+)\s*\:(.+)/);
    if (keyValue) {
      var styleName = keyValue[1];
      var styleValue = goog.string.trim(keyValue[2]);
      result[goog.string.toCamelCase(styleName.toLowerCase())] = styleValue;
    }
  });
  return result;
};
goog.style.toStyleAttribute = function(obj) {
  var buffer = [];
  goog.object.forEach(obj, function(value, key) {
    buffer.push(goog.string.toSelectorCase(key), ":", value, ";");
  });
  return buffer.join("");
};
goog.style.setFloat = function(el, value) {
  el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] = value;
};
goog.style.getFloat = function(el) {
  return el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] || "";
};
goog.style.getScrollbarWidth = function(opt_className) {
  var outerDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  if (opt_className) {
    outerDiv.className = opt_className;
  }
  outerDiv.style.cssText = "overflow:auto;" + "position:absolute;top:0;width:100px;height:100px";
  var innerDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  goog.style.setSize(innerDiv, "200px", "200px");
  outerDiv.appendChild(innerDiv);
  goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);
  var width = outerDiv.offsetWidth - outerDiv.clientWidth;
  goog.dom.removeNode(outerDiv);
  return width;
};
goog.style.MATRIX_TRANSLATION_REGEX_ = new RegExp("matrix\\([0-9\\.\\-]+, [0-9\\.\\-]+, " + "[0-9\\.\\-]+, [0-9\\.\\-]+, " + "([0-9\\.\\-]+)p?x?, ([0-9\\.\\-]+)p?x?\\)");
goog.style.getCssTranslation = function(element) {
  var transform = goog.style.getComputedTransform(element);
  if (!transform) {
    return new goog.math.Coordinate(0, 0);
  }
  var matches = transform.match(goog.style.MATRIX_TRANSLATION_REGEX_);
  if (!matches) {
    return new goog.math.Coordinate(0, 0);
  }
  return new goog.math.Coordinate(parseFloat(matches[1]), parseFloat(matches[2]));
};
goog.provide("goog.events.EventTarget");
goog.require("goog.Disposable");
goog.require("goog.asserts");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.Listenable");
goog.require("goog.events.ListenerMap");
goog.require("goog.object");
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
  this.eventTargetListeners_ = new goog.events.ListenerMap(this);
  this.actualEventTarget_ = this;
  this.parentEventTarget_ = null;
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
goog.events.Listenable.addImplementation(goog.events.EventTarget);
goog.events.EventTarget.MAX_ANCESTORS_ = 1E3;
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_;
};
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent;
};
goog.events.EventTarget.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope);
};
goog.events.EventTarget.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope);
};
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  this.assertInitialized_();
  var ancestorsTree, ancestor = this.getParentEventTarget();
  if (ancestor) {
    ancestorsTree = [];
    var ancestorCount = 1;
    for (;ancestor;ancestor = ancestor.getParentEventTarget()) {
      ancestorsTree.push(ancestor);
      goog.asserts.assert(++ancestorCount < goog.events.EventTarget.MAX_ANCESTORS_, "infinite loop");
    }
  }
  return goog.events.EventTarget.dispatchEventInternal_(this.actualEventTarget_, e, ancestorsTree);
};
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  this.removeAllListeners();
  this.parentEventTarget_ = null;
};
goog.events.EventTarget.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  this.assertInitialized_();
  return this.eventTargetListeners_.add(String(type), listener, false, opt_useCapture, opt_listenerScope);
};
goog.events.EventTarget.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.add(String(type), listener, true, opt_useCapture, opt_listenerScope);
};
goog.events.EventTarget.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.remove(String(type), listener, opt_useCapture, opt_listenerScope);
};
goog.events.EventTarget.prototype.unlistenByKey = function(key) {
  return this.eventTargetListeners_.removeByKey(key);
};
goog.events.EventTarget.prototype.removeAllListeners = function(opt_type) {
  if (!this.eventTargetListeners_) {
    return 0;
  }
  return this.eventTargetListeners_.removeAll(opt_type);
};
goog.events.EventTarget.prototype.fireListeners = function(type, capture, eventObject) {
  var listenerArray = this.eventTargetListeners_.listeners[String(type)];
  if (!listenerArray) {
    return true;
  }
  listenerArray = listenerArray.concat();
  var rv = true;
  for (var i = 0;i < listenerArray.length;++i) {
    var listener = listenerArray[i];
    if (listener && !listener.removed && listener.capture == capture) {
      var listenerFn = listener.listener;
      var listenerHandler = listener.handler || listener.src;
      if (listener.callOnce) {
        this.unlistenByKey(listener);
      }
      rv = listenerFn.call(listenerHandler, eventObject) !== false && rv;
    }
  }
  return rv && eventObject.returnValue_ != false;
};
goog.events.EventTarget.prototype.getListeners = function(type, capture) {
  return this.eventTargetListeners_.getListeners(String(type), capture);
};
goog.events.EventTarget.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
  return this.eventTargetListeners_.getListener(String(type), listener, capture, opt_listenerScope);
};
goog.events.EventTarget.prototype.hasListener = function(opt_type, opt_capture) {
  var id = goog.isDef(opt_type) ? String(opt_type) : undefined;
  return this.eventTargetListeners_.hasListener(id, opt_capture);
};
goog.events.EventTarget.prototype.setTargetForTesting = function(target) {
  this.actualEventTarget_ = target;
};
goog.events.EventTarget.prototype.assertInitialized_ = function() {
  goog.asserts.assert(this.eventTargetListeners_, "Event target is not initialized. Did you call the superclass " + "(goog.events.EventTarget) constructor?");
};
goog.events.EventTarget.dispatchEventInternal_ = function(target, e, opt_ancestorsTree) {
  var type = e.type || (e);
  if (goog.isString(e)) {
    e = new goog.events.Event(e, target);
  } else {
    if (!(e instanceof goog.events.Event)) {
      var oldEvent = e;
      e = new goog.events.Event(type, target);
      goog.object.extend(e, oldEvent);
    } else {
      e.target = e.target || target;
    }
  }
  var rv = true, currentTarget;
  if (opt_ancestorsTree) {
    for (var i = opt_ancestorsTree.length - 1;!e.propagationStopped_ && i >= 0;i--) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, true, e) && rv;
    }
  }
  if (!e.propagationStopped_) {
    currentTarget = (e.currentTarget = target);
    rv = currentTarget.fireListeners(type, true, e) && rv;
    if (!e.propagationStopped_) {
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }
  if (opt_ancestorsTree) {
    for (i = 0;!e.propagationStopped_ && i < opt_ancestorsTree.length;i++) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }
  return rv;
};
goog.provide("goog.events.EventHandler");
goog.require("goog.Disposable");
goog.require("goog.events");
goog.require("goog.object");
goog.forwardDeclare("goog.events.EventWrapper");
goog.events.EventHandler = function(opt_scope) {
  goog.Disposable.call(this);
  this.handler_ = opt_scope;
  this.keys_ = {};
};
goog.inherits(goog.events.EventHandler, goog.Disposable);
goog.events.EventHandler.typeArray_ = [];
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn, opt_capture) {
  return this.listen_(src, type, opt_fn, opt_capture);
};
goog.events.EventHandler.prototype.listenWithScope = function(src, type, fn, capture, scope) {
  return this.listen_(src, type, fn, capture, scope);
};
goog.events.EventHandler.prototype.listen_ = function(src, type, opt_fn, opt_capture, opt_scope) {
  if (!goog.isArray(type)) {
    if (type) {
      goog.events.EventHandler.typeArray_[0] = type.toString();
    }
    type = goog.events.EventHandler.typeArray_;
  }
  for (var i = 0;i < type.length;i++) {
    var listenerObj = goog.events.listen(src, type[i], opt_fn || this.handleEvent, opt_capture || false, opt_scope || this.handler_ || this);
    if (!listenerObj) {
      return this;
    }
    var key = listenerObj.key;
    this.keys_[key] = listenerObj;
  }
  return this;
};
goog.events.EventHandler.prototype.listenOnce = function(src, type, opt_fn, opt_capture) {
  return this.listenOnce_(src, type, opt_fn, opt_capture);
};
goog.events.EventHandler.prototype.listenOnceWithScope = function(src, type, fn, capture, scope) {
  return this.listenOnce_(src, type, fn, capture, scope);
};
goog.events.EventHandler.prototype.listenOnce_ = function(src, type, opt_fn, opt_capture, opt_scope) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      this.listenOnce_(src, type[i], opt_fn, opt_capture, opt_scope);
    }
  } else {
    var listenerObj = goog.events.listenOnce(src, type, opt_fn || this.handleEvent, opt_capture, opt_scope || this.handler_ || this);
    if (!listenerObj) {
      return this;
    }
    var key = listenerObj.key;
    this.keys_[key] = listenerObj;
  }
  return this;
};
goog.events.EventHandler.prototype.listenWithWrapper = function(src, wrapper, listener, opt_capt) {
  return this.listenWithWrapper_(src, wrapper, listener, opt_capt);
};
goog.events.EventHandler.prototype.listenWithWrapperAndScope = function(src, wrapper, listener, capture, scope) {
  return this.listenWithWrapper_(src, wrapper, listener, capture, scope);
};
goog.events.EventHandler.prototype.listenWithWrapper_ = function(src, wrapper, listener, opt_capt, opt_scope) {
  wrapper.listen(src, listener, opt_capt, opt_scope || this.handler_ || this, this);
  return this;
};
goog.events.EventHandler.prototype.getListenerCount = function() {
  var count = 0;
  for (var key in this.keys_) {
    if (Object.prototype.hasOwnProperty.call(this.keys_, key)) {
      count++;
    }
  }
  return count;
};
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn, opt_capture, opt_scope) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      this.unlisten(src, type[i], opt_fn, opt_capture, opt_scope);
    }
  } else {
    var listener = goog.events.getListener(src, type, opt_fn || this.handleEvent, opt_capture, opt_scope || this.handler_ || this);
    if (listener) {
      goog.events.unlistenByKey(listener);
      delete this.keys_[listener.key];
    }
  }
  return this;
};
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_scope) {
  wrapper.unlisten(src, listener, opt_capt, opt_scope || this.handler_ || this, this);
  return this;
};
goog.events.EventHandler.prototype.removeAll = function() {
  goog.object.forEach(this.keys_, function(listenerObj, key) {
    if (this.keys_.hasOwnProperty(key)) {
      goog.events.unlistenByKey(listenerObj);
    }
  }, this);
  this.keys_ = {};
};
goog.events.EventHandler.prototype.disposeInternal = function() {
  goog.events.EventHandler.superClass_.disposeInternal.call(this);
  this.removeAll();
};
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error("EventHandler.handleEvent not implemented");
};
goog.provide("acgraph.events.DragEvent");
goog.provide("acgraph.events.Dragger");
goog.require("acgraph.math.Rect");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.style");
goog.require("goog.userAgent");
acgraph.events.Dragger = function(target, opt_handle, opt_limits) {
  goog.events.EventTarget.call(this);
  this.acelement = target;
  var parent = this.acelement.parent();
  this.parentTx_ = parent ? parent.getFullTransformation() : null;
  this.reversiveParentTx_ = this.parentTx_ ? this.parentTx_.createInverse() : null;
  this.target = this.acelement.domElement();
  this.handle = opt_handle || this.target;
  this.limits = opt_limits || new goog.math.Rect(NaN, NaN, NaN, NaN);
  this.document_ = goog.dom.getOwnerDocument(this.target);
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eventHandler_);
  acgraph.events.listen(this.handle, [acgraph.events.EventType.TOUCHSTART, acgraph.events.EventType.MOUSEDOWN], this.startDrag, false, this);
};
goog.inherits(acgraph.events.Dragger, goog.events.EventTarget);
acgraph.events.Dragger.HAS_SET_CAPTURE_ = goog.userAgent.IE || goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9.3");
acgraph.events.Dragger.prototype.target;
acgraph.events.Dragger.prototype.handle;
acgraph.events.Dragger.prototype.limits;
acgraph.events.Dragger.prototype.rightToLeft_;
acgraph.events.Dragger.prototype.clientX = 0;
acgraph.events.Dragger.prototype.clientY = 0;
acgraph.events.Dragger.prototype.startX = 0;
acgraph.events.Dragger.prototype.startY = 0;
acgraph.events.Dragger.prototype.deltaX = 0;
acgraph.events.Dragger.prototype.deltaY = 0;
acgraph.events.Dragger.prototype.pageScroll;
acgraph.events.Dragger.prototype.enabled_ = true;
acgraph.events.Dragger.prototype.dragging_ = false;
acgraph.events.Dragger.prototype.hysteresisDistanceSquared_ = 0;
acgraph.events.Dragger.prototype.mouseDownTime_ = 0;
acgraph.events.Dragger.prototype.document_;
acgraph.events.Dragger.prototype.scrollTarget_;
acgraph.events.Dragger.prototype.ieDragStartCancellingOn_ = false;
acgraph.events.Dragger.prototype.useRightPositioningForRtl_ = false;
acgraph.events.Dragger.prototype.enableRightPositioningForRtl = function(useRightPositioningForRtl) {
  this.useRightPositioningForRtl_ = useRightPositioningForRtl;
};
acgraph.events.Dragger.prototype.getHandler = function() {
  return this.eventHandler_;
};
acgraph.events.Dragger.prototype.setLimits = function(value) {
  this.limits = value || new acgraph.math.Rect(NaN, NaN, NaN, NaN);
};
acgraph.events.Dragger.prototype.hysteresis = function(opt_value) {
  if (arguments.length == 1) {
    this.hysteresisDistanceSquared_ = Math.pow(opt_value, 2);
    return this;
  }
  return Math.sqrt(this.hysteresisDistanceSquared_);
};
acgraph.events.Dragger.prototype.setScrollTarget = function(value) {
  this.scrollTarget_ = value;
};
acgraph.events.Dragger.prototype.setCancelIeDragStart = function(value) {
  this.ieDragStartCancellingOn_ = value;
};
acgraph.events.Dragger.prototype.enabled = function(opt_value) {
  if (arguments.length == 1) {
    this.enabled_ = (opt_value);
    return this;
  }
  return this.enabled_;
};
acgraph.events.Dragger.prototype.disposeInternal = function() {
  acgraph.events.Dragger.superClass_.disposeInternal.call(this);
  acgraph.events.unlisten(this.handle, [acgraph.events.EventType.TOUCHSTART, acgraph.events.EventType.MOUSEDOWN], this.startDrag, false, this);
  this.cleanUpAfterDragging_();
  this.target = null;
  this.handle = null;
};
acgraph.events.Dragger.prototype.isRightToLeft_ = function() {
  if (!goog.isDef(this.rightToLeft_)) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.target);
  }
  return this.rightToLeft_;
};
acgraph.events.Dragger.prototype.startDrag = function(e) {
  var isMouseDown = e.type == acgraph.events.EventType.MOUSEDOWN;
  e.preventDefault();
  if (this.enabled_ && !this.dragging_ && (!isMouseDown || e.isMouseActionButton())) {
    this.maybeReinitTouchEvent_(e);
    if (this.hysteresisDistanceSquared_ == 0) {
      if (this.fireDragStart_(e)) {
        this.dragging_ = true;
        e.preventDefault();
      } else {
        return;
      }
    } else {
      e.preventDefault();
    }
    this.setupDragHandlers();
    this.clientX = this.startX = e.clientX;
    this.clientY = this.startY = e.clientY;
    this.deltaX = this.acelement.getX();
    this.deltaY = this.acelement.getY();
    this.pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();
    this.mouseDownTime_ = goog.now();
  } else {
    this.dispatchEvent(acgraph.events.EventType.DRAG_EARLY_CANCEL);
  }
};
acgraph.events.Dragger.prototype.setupDragHandlers = function() {
  var doc = this.document_;
  var docEl = doc.documentElement;
  var useCapture = !acgraph.events.Dragger.HAS_SET_CAPTURE_;
  this.eventHandler_.listen(doc, [acgraph.events.EventType.TOUCHMOVE, acgraph.events.EventType.MOUSEMOVE], this.handleMove_, useCapture);
  this.eventHandler_.listen(doc, [acgraph.events.EventType.TOUCHEND, acgraph.events.EventType.MOUSEUP], this.endDrag, useCapture);
  if (acgraph.events.Dragger.HAS_SET_CAPTURE_) {
    docEl.setCapture(false);
    this.eventHandler_.listen(docEl, goog.events.EventType.LOSECAPTURE, this.endDrag);
  } else {
    this.eventHandler_.listen(goog.dom.getWindow(doc), goog.events.EventType.BLUR, this.endDrag);
  }
  if (goog.userAgent.IE && this.ieDragStartCancellingOn_) {
    this.eventHandler_.listen(doc, goog.events.EventType.DRAGSTART, goog.events.Event.preventDefault);
  }
  if (this.scrollTarget_) {
    this.eventHandler_.listen(this.scrollTarget_, goog.events.EventType.SCROLL, this.onScroll_, useCapture);
  }
};
acgraph.events.Dragger.prototype.fireDragStart_ = function(e) {
  return this.acelement.dispatchEvent(new acgraph.events.DragEvent(acgraph.events.EventType.DRAG_START, this, e.clientX, e.clientY, e));
};
acgraph.events.Dragger.prototype.cleanUpAfterDragging_ = function() {
  this.eventHandler_.removeAll();
  if (acgraph.events.Dragger.HAS_SET_CAPTURE_) {
    this.document_.releaseCapture();
  }
};
acgraph.events.Dragger.prototype.endDrag = function(e, opt_dragCanceled) {
  this.cleanUpAfterDragging_();
  if (this.dragging_) {
    this.maybeReinitTouchEvent_(e);
    this.dragging_ = false;
    var x = this.limitX(this.deltaX);
    var y = this.limitY(this.deltaY);
    var dragCanceled = opt_dragCanceled || e.type == acgraph.events.EventType.TOUCHCANCEL;
    this.acelement.dispatchEvent(new acgraph.events.DragEvent(acgraph.events.EventType.DRAG_END, this, e.clientX, e.clientY, e, x, y, dragCanceled));
  } else {
    this.acelement.dispatchEvent(acgraph.events.EventType.DRAG_EARLY_CANCEL);
  }
};
acgraph.events.Dragger.prototype.maybeReinitTouchEvent_ = function(e) {
  var type = e.type;
  if (type == acgraph.events.EventType.TOUCHSTART || type == acgraph.events.EventType.TOUCHMOVE) {
    e.init(e.getBrowserEvent().targetTouches[0], e.currentTarget);
  } else {
    if (type == acgraph.events.EventType.TOUCHEND || type == acgraph.events.EventType.TOUCHCANCEL) {
      e.init(e.getBrowserEvent().changedTouches[0], e.currentTarget);
    }
  }
};
acgraph.events.Dragger.prototype.handleMove_ = function(e) {
  if (this.enabled_) {
    this.maybeReinitTouchEvent_(e);
    var sign = this.useRightPositioningForRtl_ && this.isRightToLeft_() ? -1 : 1;
    var dx = sign * (e.clientX - this.clientX);
    var dy = e.clientY - this.clientY;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    if (!this.dragging_) {
      var diffX = this.startX - this.clientX;
      var diffY = this.startY - this.clientY;
      var distance = diffX * diffX + diffY * diffY;
      if (distance > this.hysteresisDistanceSquared_) {
        if (this.fireDragStart_(e)) {
          this.dragging_ = true;
        } else {
          if (!this.isDisposed()) {
            this.endDrag(e);
          }
          return;
        }
      }
    }
    var parent = this.acelement.parent();
    var tx = parent ? parent.getFullTransformation() : null;
    if (this.parentTx_ != tx) {
      this.parentTx_ = tx;
      this.reversiveParentTx_ = this.parentTx_ ? this.parentTx_.createInverse() : null;
    }
    this.calculatePosition_(dx, dy);
    if (this.dragging_) {
      var x = this.limitX(this.deltaX);
      var y = this.limitY(this.deltaY);
      var rv = this.acelement.dispatchEvent(new acgraph.events.DragEvent(acgraph.events.EventType.DRAG_BEFORE, this, e.clientX, e.clientY, e, x, y));
      if (rv) {
        this.doDrag(e, x, y, false);
        e.preventDefault();
      }
    }
  }
};
acgraph.events.Dragger.prototype.calculatePosition_ = function(dx, dy) {
  var pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();
  dx += pageScroll.x - this.pageScroll.x;
  dy += pageScroll.y - this.pageScroll.y;
  this.pageScroll = pageScroll;
  if (this.reversiveParentTx_) {
    var point = [dx, dy, 0, 0];
    this.reversiveParentTx_.transform(point, 0, point, 0, 2);
    dx = point[0] - point[2];
    dy = point[1] - point[3];
  }
  this.deltaX += dx;
  this.deltaY += dy;
};
acgraph.events.Dragger.prototype.onScroll_ = function(e) {
  this.calculatePosition_(0, 0);
  e.clientX = this.clientX;
  e.clientY = this.clientY;
  this.doDrag(e, this.limitX(this.deltaX), this.limitY(this.deltaY), true);
};
acgraph.events.Dragger.prototype.doDrag = function(e, x, y, dragFromScroll) {
  this.defaultAction(x, y);
  this.acelement.dispatchEvent(new acgraph.events.DragEvent(acgraph.events.EventType.DRAG, this, e.clientX, e.clientY, e, x, y));
};
acgraph.events.Dragger.prototype.limitX = function(value) {
  var rect = this.limits;
  var left = !isNaN(rect.left) ? rect.left : null;
  var width = !isNaN(rect.width) ? rect.width : 0;
  var maxX = left != null ? left + width - this.acelement.getWidth() : Infinity;
  var minX = left != null ? left : -Infinity;
  return Math.min(maxX, Math.max(minX, value));
};
acgraph.events.Dragger.prototype.limitY = function(value) {
  var rect = this.limits;
  var top = !isNaN(rect.top) ? rect.top : null;
  var height = !isNaN(rect.height) ? rect.height : 0;
  var maxY = top != null ? top + height - this.acelement.getHeight() : Infinity;
  var minY = top != null ? top : -Infinity;
  return Math.min(maxY, Math.max(minY, value));
};
acgraph.events.Dragger.prototype.defaultAction = function(x, y) {
  this.acelement.setPosition(x, y);
};
acgraph.events.Dragger.prototype.isDragging = function() {
  return this.dragging_;
};
acgraph.events.DragEvent = function(type, dragobj, clientX, clientY, browserEvent, opt_actX, opt_actY, opt_dragCanceled) {
  goog.events.Event.call(this, type);
  this.clientX = clientX;
  this.clientY = clientY;
  this.browserEvent = browserEvent;
  this.left = goog.isDef(opt_actX) ? opt_actX : dragobj.deltaX;
  this.top = goog.isDef(opt_actY) ? opt_actY : dragobj.deltaY;
  this.dragger = dragobj;
  this.dragCanceled = !!opt_dragCanceled;
};
goog.inherits(acgraph.events.DragEvent, goog.events.Event);
goog.provide("goog.graphics.AffineTransform");
goog.require("goog.math");
goog.graphics.AffineTransform = function(opt_m00, opt_m10, opt_m01, opt_m11, opt_m02, opt_m12) {
  if (arguments.length == 6) {
    this.setTransform((opt_m00), (opt_m10), (opt_m01), (opt_m11), (opt_m02), (opt_m12));
  } else {
    if (arguments.length != 0) {
      throw Error("Insufficient matrix parameters");
    } else {
      this.m00_ = this.m11_ = 1;
      this.m10_ = this.m01_ = this.m02_ = this.m12_ = 0;
    }
  }
};
goog.graphics.AffineTransform.prototype.isIdentity = function() {
  return this.m00_ == 1 && this.m10_ == 0 && this.m01_ == 0 && this.m11_ == 1 && this.m02_ == 0 && this.m12_ == 0;
};
goog.graphics.AffineTransform.prototype.clone = function() {
  return new goog.graphics.AffineTransform(this.m00_, this.m10_, this.m01_, this.m11_, this.m02_, this.m12_);
};
goog.graphics.AffineTransform.prototype.setTransform = function(m00, m10, m01, m11, m02, m12) {
  if (!goog.isNumber(m00) || !goog.isNumber(m10) || !goog.isNumber(m01) || !goog.isNumber(m11) || !goog.isNumber(m02) || !goog.isNumber(m12)) {
    throw Error("Invalid transform parameters");
  }
  this.m00_ = m00;
  this.m10_ = m10;
  this.m01_ = m01;
  this.m11_ = m11;
  this.m02_ = m02;
  this.m12_ = m12;
  return this;
};
goog.graphics.AffineTransform.prototype.copyFrom = function(tx) {
  this.m00_ = tx.m00_;
  this.m10_ = tx.m10_;
  this.m01_ = tx.m01_;
  this.m11_ = tx.m11_;
  this.m02_ = tx.m02_;
  this.m12_ = tx.m12_;
  return this;
};
goog.graphics.AffineTransform.prototype.scale = function(sx, sy) {
  this.m00_ *= sx;
  this.m10_ *= sx;
  this.m01_ *= sy;
  this.m11_ *= sy;
  return this;
};
goog.graphics.AffineTransform.prototype.preScale = function(sx, sy) {
  this.m00_ *= sx;
  this.m01_ *= sx;
  this.m02_ *= sx;
  this.m10_ *= sy;
  this.m11_ *= sy;
  this.m12_ *= sy;
  return this;
};
goog.graphics.AffineTransform.prototype.translate = function(dx, dy) {
  this.m02_ += dx * this.m00_ + dy * this.m01_;
  this.m12_ += dx * this.m10_ + dy * this.m11_;
  return this;
};
goog.graphics.AffineTransform.prototype.preTranslate = function(dx, dy) {
  this.m02_ += dx;
  this.m12_ += dy;
  return this;
};
goog.graphics.AffineTransform.prototype.rotate = function(theta, x, y) {
  return this.concatenate(goog.graphics.AffineTransform.getRotateInstance(theta, x, y));
};
goog.graphics.AffineTransform.prototype.preRotate = function(theta, x, y) {
  return this.preConcatenate(goog.graphics.AffineTransform.getRotateInstance(theta, x, y));
};
goog.graphics.AffineTransform.prototype.shear = function(shx, shy) {
  var m00 = this.m00_;
  var m10 = this.m10_;
  this.m00_ += shy * this.m01_;
  this.m10_ += shy * this.m11_;
  this.m01_ += shx * m00;
  this.m11_ += shx * m10;
  return this;
};
goog.graphics.AffineTransform.prototype.preShear = function(shx, shy) {
  var m00 = this.m00_;
  var m01 = this.m01_;
  var m02 = this.m02_;
  this.m00_ += shx * this.m10_;
  this.m01_ += shx * this.m11_;
  this.m02_ += shx * this.m12_;
  this.m10_ += shy * m00;
  this.m11_ += shy * m01;
  this.m12_ += shy * m02;
  return this;
};
goog.graphics.AffineTransform.prototype.toString = function() {
  return "matrix(" + [this.m00_, this.m10_, this.m01_, this.m11_, this.m02_, this.m12_].join(",") + ")";
};
goog.graphics.AffineTransform.prototype.getScaleX = function() {
  return this.m00_;
};
goog.graphics.AffineTransform.prototype.getScaleY = function() {
  return this.m11_;
};
goog.graphics.AffineTransform.prototype.getTranslateX = function() {
  return this.m02_;
};
goog.graphics.AffineTransform.prototype.getTranslateY = function() {
  return this.m12_;
};
goog.graphics.AffineTransform.prototype.getShearX = function() {
  return this.m01_;
};
goog.graphics.AffineTransform.prototype.getShearY = function() {
  return this.m10_;
};
goog.graphics.AffineTransform.prototype.concatenate = function(tx) {
  var m0 = this.m00_;
  var m1 = this.m01_;
  this.m00_ = tx.m00_ * m0 + tx.m10_ * m1;
  this.m01_ = tx.m01_ * m0 + tx.m11_ * m1;
  this.m02_ += tx.m02_ * m0 + tx.m12_ * m1;
  m0 = this.m10_;
  m1 = this.m11_;
  this.m10_ = tx.m00_ * m0 + tx.m10_ * m1;
  this.m11_ = tx.m01_ * m0 + tx.m11_ * m1;
  this.m12_ += tx.m02_ * m0 + tx.m12_ * m1;
  return this;
};
goog.graphics.AffineTransform.prototype.preConcatenate = function(tx) {
  var m0 = this.m00_;
  var m1 = this.m10_;
  this.m00_ = tx.m00_ * m0 + tx.m01_ * m1;
  this.m10_ = tx.m10_ * m0 + tx.m11_ * m1;
  m0 = this.m01_;
  m1 = this.m11_;
  this.m01_ = tx.m00_ * m0 + tx.m01_ * m1;
  this.m11_ = tx.m10_ * m0 + tx.m11_ * m1;
  m0 = this.m02_;
  m1 = this.m12_;
  this.m02_ = tx.m00_ * m0 + tx.m01_ * m1 + tx.m02_;
  this.m12_ = tx.m10_ * m0 + tx.m11_ * m1 + tx.m12_;
  return this;
};
goog.graphics.AffineTransform.prototype.transform = function(src, srcOff, dst, dstOff, numPts) {
  var i = srcOff;
  var j = dstOff;
  var srcEnd = srcOff + 2 * numPts;
  while (i < srcEnd) {
    var x = src[i++];
    var y = src[i++];
    dst[j++] = x * this.m00_ + y * this.m01_ + this.m02_;
    dst[j++] = x * this.m10_ + y * this.m11_ + this.m12_;
  }
};
goog.graphics.AffineTransform.prototype.getDeterminant = function() {
  return this.m00_ * this.m11_ - this.m01_ * this.m10_;
};
goog.graphics.AffineTransform.prototype.isInvertible = function() {
  var det = this.getDeterminant();
  return goog.math.isFiniteNumber(det) && goog.math.isFiniteNumber(this.m02_) && goog.math.isFiniteNumber(this.m12_) && det != 0;
};
goog.graphics.AffineTransform.prototype.createInverse = function() {
  var det = this.getDeterminant();
  return new goog.graphics.AffineTransform(this.m11_ / det, -this.m10_ / det, -this.m01_ / det, this.m00_ / det, (this.m01_ * this.m12_ - this.m11_ * this.m02_) / det, (this.m10_ * this.m02_ - this.m00_ * this.m12_) / det);
};
goog.graphics.AffineTransform.getScaleInstance = function(sx, sy) {
  return (new goog.graphics.AffineTransform).setToScale(sx, sy);
};
goog.graphics.AffineTransform.getTranslateInstance = function(dx, dy) {
  return (new goog.graphics.AffineTransform).setToTranslation(dx, dy);
};
goog.graphics.AffineTransform.getShearInstance = function(shx, shy) {
  return (new goog.graphics.AffineTransform).setToShear(shx, shy);
};
goog.graphics.AffineTransform.getRotateInstance = function(theta, x, y) {
  return (new goog.graphics.AffineTransform).setToRotation(theta, x, y);
};
goog.graphics.AffineTransform.prototype.setToScale = function(sx, sy) {
  return this.setTransform(sx, 0, 0, sy, 0, 0);
};
goog.graphics.AffineTransform.prototype.setToTranslation = function(dx, dy) {
  return this.setTransform(1, 0, 0, 1, dx, dy);
};
goog.graphics.AffineTransform.prototype.setToShear = function(shx, shy) {
  return this.setTransform(1, shy, shx, 1, 0, 0);
};
goog.graphics.AffineTransform.prototype.setToRotation = function(theta, x, y) {
  var cos = Math.cos(theta);
  var sin = Math.sin(theta);
  return this.setTransform(cos, sin, -sin, cos, x - x * cos + y * sin, y - x * sin - y * cos);
};
goog.graphics.AffineTransform.prototype.equals = function(tx) {
  if (this == tx) {
    return true;
  }
  if (!tx) {
    return false;
  }
  return this.m00_ == tx.m00_ && this.m01_ == tx.m01_ && this.m02_ == tx.m02_ && this.m10_ == tx.m10_ && this.m11_ == tx.m11_ && this.m12_ == tx.m12_;
};
goog.provide("acgraph.error");
acgraph.error.Code = {ERROR_IS_NOT_FOUND:0, STAGE_TYPE_NOT_SUPPORTED:1, CONTAINER_SHOULD_BE_DEFINED:2, STAGE_SHOULD_HAVE_DOM_ELEMENT:3, PARENT_UNABLE_TO_BE_SET:4, OPERATION_ON_DISPOSED:5, DIRTY_AFTER_SYNC_RENDER:6, STAGE_MISMATCH:7, WRONG_SWAPPING:8, EMPTY_PATH:9, UNIMPLEMENTED_METHOD:10, REQUIRED_PARAMETER_MISSING:11, PARAMETER_TYPE_MISMATCH:12, PARAMETER_IS_NULL_OR_UNDEFINED:13, INVALID_NUMBER_OF_PARAMETERS:14, FEATURE_NOT_SUPPORTED_IN_VML:15};
acgraph.error.Message = {0:"Can't find an error message that corresponds to the specified error code", 1:"Requested stage type is not supported", 2:"Container should be defined to render stage", 3:"Stage should have a DOM element", 4:"Unable to set the parent component", 5:"Trying to perform an operation with the disposed element", 6:"Synchronous rendering didn't clean up all dirty states", 7:"Can't add an element constructed by another Stage", 8:"Wrong arguments passed to swapChildren", 9:"Path must start with moveTo command", 
10:"Method must be implemented", 11:"Missing required parameter", 12:"Parameter type mismatch", 13:"Required parameter is null or undefined", 14:"Invalid number of parameters", 15:"Sorry, this feature in not supported in VML oriented browsers"};
acgraph.error.getErrorMessage = function(errorCode) {
  return acgraph.error.Message[errorCode] || "Unknown error happened";
};
goog.provide("acgraph.vector");
goog.provide("acgraph.vector.Anchor");
goog.provide("acgraph.vector.Cursor");
goog.provide("acgraph.vector.ILayer");
goog.require("acgraph.math.Rect");
goog.require("goog.graphics.AffineTransform");
acgraph.vector.Anchor = {LEFT_TOP:"leftTop", LEFT_CENTER:"leftCenter", LEFT_BOTTOM:"leftBottom", CENTER_TOP:"centerTop", CENTER:"center", CENTER_BOTTOM:"centerBottom", RIGHT_TOP:"rightTop", RIGHT_CENTER:"rightCenter", RIGHT_BOTTOM:"rightBottom"};
acgraph.vector.Cursor = {DEFAULT:"default", CROSSHAIR:"crosshair", POINTER:"pointer", MOVE:"move", TEXT:"text", WAIT:"wait", HELP:"help", N_RESIZE:"n-resize", NE_RESIZE:"ne-resize", E_RESIZE:"e-resize", SE_RESIZE:"se-resize", S_RESIZE:"s-resize", SW_RESIZE:"sw-resize", W_RESIZE:"w-resize", NW_RESIZE:"nw-resize", NS_RESIZE:"ns-resize", EW_RESIZE:"ew-resize", NWSE_RESIZE:"nwse-resize", NESW_RESIZE:"nesw-resize"};
acgraph.vector.getCoordinateByAnchor = function(bounds, anchor) {
  var x = bounds.left;
  var y = bounds.top;
  anchor = anchor.toLowerCase();
  switch(anchor) {
    case "lefttop":
    ;
    case "topleft":
    ;
    case "lt":
    ;
    case "tl":
      break;
    case "leftcenter":
    ;
    case "centerleft":
    ;
    case "left":
    ;
    case "lc":
    ;
    case "cl":
    ;
    case "l":
      y += bounds.height / 2;
      break;
    case "leftbottom":
    ;
    case "bottomleft":
    ;
    case "lb":
    ;
    case "bl":
      y += bounds.height;
      break;
    case "centertop":
    ;
    case "topcenter":
    ;
    case "top":
    ;
    case "ct":
    ;
    case "tc":
    ;
    case "t":
      x += bounds.width / 2;
      break;
    case "centercenter":
    ;
    case "center":
    ;
    case "c":
      x += bounds.width / 2;
      y += bounds.height / 2;
      break;
    case "centerbottom":
    ;
    case "bottomcenter":
    ;
    case "bottom":
    ;
    case "cb":
    ;
    case "bc":
    ;
    case "b":
      x += bounds.width / 2;
      y += bounds.height;
      break;
    case "righttop":
    ;
    case "topright":
    ;
    case "tr":
    ;
    case "rt":
      x += bounds.width;
      break;
    case "rightcenter":
    ;
    case "centerright":
    ;
    case "right":
    ;
    case "rc":
    ;
    case "cr":
    ;
    case "r":
      x += bounds.width;
      y += bounds.height / 2;
      break;
    case "rightbottom":
    ;
    case "bottomright":
    ;
    case "rb":
    ;
    case "br":
      x += bounds.width;
      y += bounds.height;
      break;
  }
  return [x, y];
};
acgraph.vector.ILayer = function() {
};
acgraph.vector.ILayer.prototype.addChild;
acgraph.vector.ILayer.prototype.removeChild;
acgraph.vector.ILayer.prototype.notifyRemoved;
acgraph.vector.ILayer.prototype.getStage;
acgraph.vector.GradientKey;
acgraph.vector.SolidFill;
acgraph.vector.LinearGradientFill;
acgraph.vector.RadialGradientFill;
acgraph.vector.ImageFill;
acgraph.vector.ColoredFill;
acgraph.vector.Fill;
acgraph.vector.SolidStroke;
acgraph.vector.LinearGradientStroke;
acgraph.vector.RadialGradientStroke;
acgraph.vector.Stroke;
acgraph.vector.AnyColor;
acgraph.vector.TextStyle;
acgraph.vector.TextSegmentStyle;
acgraph.vector.StrokeLineJoin = {MITER:"miter", ROUND:"round", BEVEL:"bevel"};
acgraph.vector.StrokeLineCap = {BUTT:"butt", ROUND:"round", SQUARE:"square"};
acgraph.vector.ImageFillMode = {STRETCH:"stretch", FIT_MAX:"fitMax", FIT:"fit", TILE:"tile"};
acgraph.vector.PaperSize = {US_LETTER:"usletter", A0:"a0", A1:"a1", A2:"a2", A3:"a3", A4:"a4", A5:"a5", A6:"a6"};
acgraph.vector.parseTransformationString = function(value) {
  var i, j, len, len_;
  var transforms = value.trim().replace(/\(\s+/gi, "(").replace(/\s+\)/gi, ")").replace(/(\s+,\s+)|(\s+)/gi, ",").replace(/(\)),*(\w)/gi, "$1 $2").split(" ");
  var tx = new goog.graphics.AffineTransform;
  for (j = 0, len_ = transforms.length;j < len_;j++) {
    var transform = transforms[j];
    var r = /^(matrix|translate|rotate|scale|skewX|skewY)\(([e\d.,-]+)\)/i;
    var result = r.exec(transform);
    var type = result[1];
    var params = (result[2].split(","));
    for (i = 0, len = params.length;i < len;i++) {
      params[i] = parseFloat(params[i]);
    }
    switch(type) {
      case "matrix":
        var new_tx = new goog.graphics.AffineTransform(params[0], params[1], params[2], params[3], params[4], params[5]);
        tx.concatenate(new_tx);
        break;
      case "translate":
        tx.translate(params[0], params[1] || 0);
        break;
      case "rotate":
        tx.rotate(goog.math.toRadians(params[0]), params[1] || 0, params[2] || 0);
        break;
      case "scale":
        tx.scale(params[0], params[1] || 0);
        break;
      case "skewX":
        tx.shear(Math.tan(goog.math.toRadians(params[0])), 0);
        break;
      case "skewY":
        tx.shear(0, Math.tan(goog.math.toRadians(params[0])));
        break;
    }
  }
  return tx;
};
acgraph.vector.normalizeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  var newFill;
  var opacity;
  var keys;
  var key;
  var i;
  var color;
  var newKeys;
  var newKey;
  if (goog.isString(opt_fillOrColorOrKeys)) {
    newFill = acgraph.vector.parseColor(opt_fillOrColorOrKeys, false);
    if (goog.isString(newFill) && goog.isDef(opt_opacityOrAngleOrCx)) {
      opacity = parseFloat(opt_opacityOrAngleOrCx);
      newFill = {"color":opt_fillOrColorOrKeys, "opacity":isNaN(opacity) ? 1 : goog.math.clamp(opacity, 0, 1)};
    }
  } else {
    if (goog.isArray(opt_fillOrColorOrKeys)) {
      keys = goog.array.slice(opt_fillOrColorOrKeys, 0);
      for (i = keys.length;i--;) {
        key = keys[i];
        if (goog.isString(key)) {
          key = acgraph.vector.parseKey(key);
        }
        if (isNaN(key["offset"])) {
          key["offset"] = i / (keys.length - 1 || 1);
        }
        keys[i] = (key);
      }
      newKeys = goog.array.slice(keys, 0);
      newKeys.sort(function(k1, k2) {
        return k1["offset"] - k2["offset"];
      });
      if (newKeys[0]["offset"] != 0) {
        newKey = ({"offset":0, "color":(keys[0]["color"])});
        if (goog.isDef(keys[0]["opacity"]) && !isNaN(keys[0]["opacity"])) {
          newKey["opacity"] = goog.math.clamp(keys[0]["opacity"], 0, 1);
        }
        keys.unshift(newKey);
      }
      if (newKeys[newKeys.length - 1]["offset"] != 1) {
        newKey = ({"offset":1, "color":(keys[keys.length - 1]["color"])});
        if (goog.isDef(keys[keys.length - 1]["opacity"]) && !isNaN(keys[keys.length - 1]["opacity"])) {
          newKey["opacity"] = goog.math.clamp(keys[keys.length - 1]["opacity"], 0, 1);
        }
        keys.push(newKey);
      }
      if (goog.isNumber(opt_opacityOrAngleOrCx) && !isNaN(opt_opacityOrAngleOrCx) && goog.isNumber(opt_modeOrCy) && !isNaN(opt_modeOrCy)) {
        var cx = opt_opacityOrAngleOrCx || 0;
        var cy = opt_modeOrCy || 0;
        newFill = {"keys":keys, "cx":cx, "cy":cy, "mode":acgraph.vector.normalizeGradientMode(opt_opacityOrMode), "fx":isNaN(opt_fx) ? cx : +opt_fx, "fy":isNaN(opt_fy) ? cy : +opt_fy, "opacity":goog.math.clamp(goog.isDef(opt_opacity) ? opt_opacity : 1, 0, 1)};
      } else {
        newFill = {"keys":keys, "angle":+opt_opacityOrAngleOrCx || 0, "mode":acgraph.vector.normalizeGradientMode(opt_modeOrCy) || !!opt_modeOrCy, "opacity":goog.math.clamp(!isNaN(+opt_opacityOrMode) ? +opt_opacityOrMode : 1, 0, 1)};
      }
    } else {
      if (goog.isObject(opt_fillOrColorOrKeys)) {
        if (opt_fillOrColorOrKeys instanceof acgraph.vector.PatternFill) {
          newFill = opt_fillOrColorOrKeys;
        } else {
          if (opt_fillOrColorOrKeys["type"] == "pattern") {
            delete opt_fillOrColorOrKeys["id"];
            var bounds = opt_fillOrColorOrKeys["bounds"];
            bounds = new acgraph.math.Rect(bounds["left"], bounds["top"], bounds["width"], bounds["height"]);
            newFill = acgraph.patternFill(bounds);
            newFill.deserialize(opt_fillOrColorOrKeys);
          } else {
            if ("keys" in opt_fillOrColorOrKeys) {
              keys = goog.array.slice(opt_fillOrColorOrKeys["keys"], 0);
              for (i = keys.length;i--;) {
                key = keys[i];
                if (goog.isString(key)) {
                  newKey = acgraph.vector.parseKey(key);
                } else {
                  if (goog.isString(key["color"])) {
                    color = key["color"];
                  } else {
                    if (goog.isArray(key["color"])) {
                      color = goog.color.rgbArrayToHex(key["color"]);
                    } else {
                      color = "black";
                    }
                  }
                  newKey = {"offset":key["offset"], "color":color};
                  if (!isNaN(key["opacity"])) {
                    newKey["opacity"] = goog.math.clamp(key["opacity"], 0, 1);
                  }
                }
                if (isNaN(newKey["offset"])) {
                  newKey["offset"] = i / (keys.length - 1 || 1);
                }
                keys[i] = (newKey);
              }
              newKeys = goog.array.slice(keys, 0);
              newKeys.sort(function(k1, k2) {
                return k1["offset"] - k2["offset"];
              });
              if (newKeys[0]["offset"] != 0) {
                newKey = ({"offset":0, "color":(keys[0]["color"])});
                if (goog.isDef(keys[0]["opacity"]) && !isNaN(keys[0]["opacity"])) {
                  newKey["opacity"] = goog.math.clamp(keys[0]["opacity"], 0, 1);
                }
                keys.unshift(newKey);
              }
              if (newKeys[newKeys.length - 1]["offset"] != 1) {
                newKey = ({"offset":1, "color":(keys[keys.length - 1]["color"])});
                if (goog.isDef(keys[keys.length - 1]["opacity"]) && !isNaN(keys[keys.length - 1]["opacity"])) {
                  newKey["opacity"] = goog.math.clamp(keys[keys.length - 1]["opacity"], 0, 1);
                }
                keys.push(newKey);
              }
              opacity = goog.math.clamp(goog.isDef(opt_fillOrColorOrKeys["opacity"]) ? opt_fillOrColorOrKeys["opacity"] : 1, 0, 1);
              var mode = acgraph.vector.normalizeGradientMode(opt_fillOrColorOrKeys["mode"]);
              cx = opt_fillOrColorOrKeys["cx"];
              cy = opt_fillOrColorOrKeys["cy"];
              if (goog.isNumber(cx) && !isNaN(cx) && goog.isNumber(cy) && !isNaN(cy)) {
                newFill = {"keys":keys, "cx":+cx, "cy":+cy, "mode":mode, "fx":isNaN(opt_fillOrColorOrKeys["fx"]) ? +opt_fillOrColorOrKeys["cx"] : +opt_fillOrColorOrKeys["fx"], "fy":isNaN(opt_fillOrColorOrKeys["fy"]) ? +opt_fillOrColorOrKeys["cy"] : +opt_fillOrColorOrKeys["fy"], "opacity":opacity};
              } else {
                newFill = {"keys":keys, "angle":+opt_fillOrColorOrKeys["angle"] || 0, "mode":mode || !!opt_fillOrColorOrKeys["mode"], "opacity":opacity};
              }
              var transform = opt_fillOrColorOrKeys["transform"];
              if (goog.isDefAndNotNull(transform)) {
                if (transform instanceof goog.graphics.AffineTransform) {
                  newFill["transform"] = transform;
                } else {
                  if (goog.isObject(transform)) {
                    newFill["transform"] = new goog.graphics.AffineTransform;
                    newFill["transform"].setTransform(transform["m00"], transform["m10"], transform["m01"], transform["m11"], transform["m02"], transform["m12"]);
                  } else {
                    if (goog.isString(transform)) {
                      newFill["transform"] = acgraph.vector.parseTransformationString(transform);
                    }
                  }
                }
              }
            } else {
              if ("src" in opt_fillOrColorOrKeys) {
                newFill = {"src":opt_fillOrColorOrKeys["src"], "mode":goog.isDef(opt_fillOrColorOrKeys["mode"]) ? opt_fillOrColorOrKeys["mode"] : acgraph.vector.ImageFillMode.STRETCH, "opacity":goog.math.clamp(goog.isDef(opt_fillOrColorOrKeys["opacity"]) ? opt_fillOrColorOrKeys["opacity"] : 1, 0, 1)};
              } else {
                color = goog.isString(opt_fillOrColorOrKeys["color"]) ? opt_fillOrColorOrKeys["color"] : "black";
                if (isNaN(opt_fillOrColorOrKeys["opacity"])) {
                  newFill = color;
                } else {
                  newFill = {"color":color, "opacity":goog.math.clamp(opt_fillOrColorOrKeys["opacity"], 0, 1)};
                }
              }
            }
          }
        }
      } else {
        newFill = "none";
      }
    }
  }
  return newFill;
};
acgraph.vector.normalizeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  var tmp;
  var newStroke;
  if (goog.isNull(opt_strokeOrFill)) {
    newStroke = "none";
  } else {
    if (goog.isString(opt_strokeOrFill)) {
      tmp = goog.string.splitLimit(opt_strokeOrFill, " ", 1);
      var tmpThickness = parseFloat(tmp[0]);
      if (!isNaN(tmpThickness)) {
        opt_strokeOrFill = tmp[1];
        opt_thickness = tmpThickness;
      }
    }
    var setAsComplexStroke = goog.isObject(opt_strokeOrFill);
    var thickness = parseFloat(setAsComplexStroke && "thickness" in opt_strokeOrFill ? opt_strokeOrFill["thickness"] : opt_thickness);
    if (thickness == 0) {
      return "none";
    }
    var hasDash = setAsComplexStroke && "dash" in opt_strokeOrFill;
    var hasJoin = setAsComplexStroke && "lineJoin" in opt_strokeOrFill;
    var hasCap = setAsComplexStroke && "lineCap" in opt_strokeOrFill;
    tmp = acgraph.vector.normalizeFill((opt_strokeOrFill));
    if (tmp == "none") {
      return (tmp);
    }
    newStroke = tmp instanceof acgraph.vector.PatternFill ? "black" : (tmp);
    if (!isNaN(thickness) || hasDash || hasJoin || hasCap || goog.isDef(opt_dashpattern) || goog.isDef(opt_lineJoin) || goog.isDef(opt_lineCap)) {
      if (goog.isString(newStroke)) {
        newStroke = ({"color":newStroke});
      }
      if (!isNaN(thickness)) {
        newStroke["thickness"] = thickness;
      }
      if (hasDash) {
        newStroke["dash"] = opt_strokeOrFill["dash"] || "none";
      } else {
        if (goog.isDefAndNotNull(opt_dashpattern)) {
          newStroke["dash"] = opt_dashpattern || "none";
        }
      }
      if (hasJoin) {
        newStroke["lineJoin"] = opt_strokeOrFill["lineJoin"] || "none";
      } else {
        if (goog.isDefAndNotNull(opt_lineJoin)) {
          newStroke["lineJoin"] = opt_lineJoin || "none";
        }
      }
      if (hasCap) {
        newStroke["lineCap"] = opt_strokeOrFill["lineCap"] || "none";
      } else {
        if (goog.isDefAndNotNull(opt_lineCap)) {
          newStroke["lineCap"] = opt_lineCap || "none";
        }
      }
    }
  }
  return newStroke;
};
acgraph.vector.normalizeHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  var newFill;
  if (goog.isString(opt_patternFillOrType) && opt_patternFillOrType.toLowerCase() == "none") {
    return null;
  }
  if (goog.isString(opt_patternFillOrType) || goog.isNumber(opt_patternFillOrType)) {
    newFill = acgraph.hatchFill((opt_patternFillOrType), opt_color, goog.isDef(opt_thickness) ? parseFloat(opt_thickness) : undefined, goog.isDef(opt_size) ? parseFloat(opt_size) : undefined);
  } else {
    if (opt_patternFillOrType instanceof acgraph.vector.PatternFill) {
      newFill = opt_patternFillOrType;
    } else {
      if (goog.isObject(opt_patternFillOrType)) {
        if (opt_patternFillOrType["type"] == "pattern") {
          delete opt_patternFillOrType["id"];
          var bounds = opt_patternFillOrType["bounds"];
          bounds = new acgraph.math.Rect(bounds["left"], bounds["top"], bounds["width"], bounds["height"]);
          newFill = acgraph.patternFill(bounds);
          newFill.deserialize(opt_patternFillOrType);
        } else {
          newFill = acgraph.hatchFill((opt_patternFillOrType["type"]), opt_patternFillOrType["color"], opt_patternFillOrType["thickness"], opt_patternFillOrType["size"]);
        }
      } else {
        newFill = null;
      }
    }
  }
  return newFill;
};
acgraph.vector.normalizePageSize = function(opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_default) {
  if (!goog.isDef(opt_default)) {
    opt_default = acgraph.vector.PaperSize.A4;
  }
  var result = acgraph.utils.exporting.PaperSize[opt_default];
  var size;
  if (goog.isDef(opt_paperSizeOrWidth) && goog.isDef(opt_landscapeOrHeight)) {
    if (goog.isString(opt_paperSizeOrWidth) && goog.isBoolean(opt_landscapeOrHeight)) {
      size = acgraph.utils.exporting.PaperSize[opt_paperSizeOrWidth];
      if (size) {
        if (opt_landscapeOrHeight) {
          result = {width:size.height, height:size.width};
        } else {
          result = size;
        }
      }
    } else {
      result.width = opt_paperSizeOrWidth.toString();
      result.height = opt_landscapeOrHeight.toString();
    }
  } else {
    if (goog.isDef(opt_paperSizeOrWidth)) {
      size = acgraph.utils.exporting.PaperSize[opt_paperSizeOrWidth.toString()];
      if (size) {
        result = size;
      } else {
        result.width = opt_paperSizeOrWidth.toString();
      }
    }
  }
  if (!goog.string.endsWith(result.width, "px")) {
    result.width += "px";
  }
  if (!goog.string.endsWith(result.height, "px")) {
    result.height += "px";
  }
  return result;
};
acgraph.vector.normalizeGradientMode = function(mode) {
  if (goog.isDefAndNotNull(mode)) {
    if (mode instanceof acgraph.math.Rect) {
      return mode;
    } else {
      if (goog.isObject(mode) && !isNaN(mode["left"]) && !isNaN(mode["top"]) && !isNaN(mode["width"]) && !isNaN(mode["height"])) {
        return new acgraph.math.Rect(mode["left"], mode["top"], mode["width"], mode["height"]);
      }
    }
  }
  return null;
};
acgraph.vector.parseColor = function(color, forceObject) {
  var tmp = color.split(" ");
  var opacity = tmp.length > 1 ? goog.math.clamp(+tmp[tmp.length - 1], 0, 1) : NaN;
  if (!isNaN(opacity)) {
    tmp.pop();
    color = tmp.join(" ");
  } else {
    if (forceObject) {
      return {"color":color};
    } else {
      opacity = 1;
    }
  }
  return forceObject || opacity != 1 ? {"color":color, "opacity":opacity} : color;
};
acgraph.vector.parseKey = function(key) {
  var tmp = goog.string.splitLimit(key, " ", 1);
  var color;
  var offset = NaN;
  if (tmp.length > 1) {
    offset = parseFloat(tmp[0]);
    color = isNaN(offset) ? key : tmp[1];
  } else {
    color = key;
  }
  var result = acgraph.vector.parseColor(color, true);
  if (!isNaN(offset)) {
    result["offset"] = goog.math.clamp(offset, 0, 1);
  }
  return (result);
};
acgraph.vector.getThickness = function(stroke) {
  var res = stroke["thickness"];
  return stroke == "none" ? 0 : isNaN(res) || goog.isNull(res) ? 1 : res;
};
goog.exportSymbol("acgraph.vector.Anchor.CENTER", acgraph.vector.Anchor.CENTER);
goog.exportSymbol("acgraph.vector.Anchor.CENTER_BOTTOM", acgraph.vector.Anchor.CENTER_BOTTOM);
goog.exportSymbol("acgraph.vector.Anchor.CENTER_TOP", acgraph.vector.Anchor.CENTER_TOP);
goog.exportSymbol("acgraph.vector.Anchor.LEFT_BOTTOM", acgraph.vector.Anchor.LEFT_BOTTOM);
goog.exportSymbol("acgraph.vector.Anchor.LEFT_CENTER", acgraph.vector.Anchor.LEFT_CENTER);
goog.exportSymbol("acgraph.vector.Anchor.LEFT_TOP", acgraph.vector.Anchor.LEFT_TOP);
goog.exportSymbol("acgraph.vector.Anchor.RIGHT_BOTTOM", acgraph.vector.Anchor.RIGHT_BOTTOM);
goog.exportSymbol("acgraph.vector.Anchor.RIGHT_CENTER", acgraph.vector.Anchor.RIGHT_CENTER);
goog.exportSymbol("acgraph.vector.Anchor.RIGHT_TOP", acgraph.vector.Anchor.RIGHT_TOP);
goog.exportSymbol("acgraph.vector.Cursor.DEFAULT", acgraph.vector.Cursor.DEFAULT);
goog.exportSymbol("acgraph.vector.Cursor.CROSSHAIR", acgraph.vector.Cursor.CROSSHAIR);
goog.exportSymbol("acgraph.vector.Cursor.POINTER", acgraph.vector.Cursor.POINTER);
goog.exportSymbol("acgraph.vector.Cursor.MOVE", acgraph.vector.Cursor.MOVE);
goog.exportSymbol("acgraph.vector.Cursor.TEXT", acgraph.vector.Cursor.TEXT);
goog.exportSymbol("acgraph.vector.Cursor.WAIT", acgraph.vector.Cursor.WAIT);
goog.exportSymbol("acgraph.vector.Cursor.HELP", acgraph.vector.Cursor.HELP);
goog.exportSymbol("acgraph.vector.Cursor.N_RESIZE", acgraph.vector.Cursor.N_RESIZE);
goog.exportSymbol("acgraph.vector.Cursor.NE_RESIZE", acgraph.vector.Cursor.NE_RESIZE);
goog.exportSymbol("acgraph.vector.Cursor.E_RESIZE", acgraph.vector.Cursor.E_RESIZE);
goog.exportSymbol("acgraph.vector.Cursor.SE_RESIZE", acgraph.vector.Cursor.SE_RESIZE);
goog.exportSymbol("acgraph.vector.Cursor.S_RESIZE", acgraph.vector.Cursor.S_RESIZE);
goog.exportSymbol("acgraph.vector.Cursor.SW_RESIZE", acgraph.vector.Cursor.SW_RESIZE);
goog.exportSymbol("acgraph.vector.Cursor.W_RESIZE", acgraph.vector.Cursor.W_RESIZE);
goog.exportSymbol("acgraph.vector.Cursor.NW_RESIZE", acgraph.vector.Cursor.NW_RESIZE);
goog.exportSymbol("acgraph.vector.ImageFillMode.FIT", acgraph.vector.ImageFillMode.FIT);
goog.exportSymbol("acgraph.vector.ImageFillMode.FIT_MAX", acgraph.vector.ImageFillMode.FIT_MAX);
goog.exportSymbol("acgraph.vector.ImageFillMode.STRETCH", acgraph.vector.ImageFillMode.STRETCH);
goog.exportSymbol("acgraph.vector.ImageFillMode.TILE", acgraph.vector.ImageFillMode.TILE);
goog.exportSymbol("acgraph.vector.PaperSize.US_LETTER", acgraph.vector.PaperSize.US_LETTER);
goog.exportSymbol("acgraph.vector.PaperSize.A0", acgraph.vector.PaperSize.A0);
goog.exportSymbol("acgraph.vector.PaperSize.A1", acgraph.vector.PaperSize.A1);
goog.exportSymbol("acgraph.vector.PaperSize.A2", acgraph.vector.PaperSize.A2);
goog.exportSymbol("acgraph.vector.PaperSize.A3", acgraph.vector.PaperSize.A3);
goog.exportSymbol("acgraph.vector.PaperSize.A4", acgraph.vector.PaperSize.A4);
goog.exportSymbol("acgraph.vector.PaperSize.A5", acgraph.vector.PaperSize.A5);
goog.exportSymbol("acgraph.vector.PaperSize.A6", acgraph.vector.PaperSize.A6);
goog.exportSymbol("acgraph.vector.StrokeLineJoin.MITER", acgraph.vector.StrokeLineJoin.MITER);
goog.exportSymbol("acgraph.vector.StrokeLineJoin.ROUND", acgraph.vector.StrokeLineJoin.ROUND);
goog.exportSymbol("acgraph.vector.StrokeLineJoin.BEVEL", acgraph.vector.StrokeLineJoin.BEVEL);
goog.exportSymbol("acgraph.vector.StrokeLineCap.BUTT", acgraph.vector.StrokeLineCap.BUTT);
goog.exportSymbol("acgraph.vector.StrokeLineCap.ROUND", acgraph.vector.StrokeLineCap.ROUND);
goog.exportSymbol("acgraph.vector.StrokeLineCap.SQUARE", acgraph.vector.StrokeLineCap.SQUARE);
goog.exportSymbol("acgraph.vector.normalizeFill", acgraph.vector.normalizeFill);
goog.exportSymbol("acgraph.vector.normalizeStroke", acgraph.vector.normalizeStroke);
goog.exportSymbol("acgraph.vector.normalizeHatchFill", acgraph.vector.normalizeHatchFill);
goog.provide("acgraph.vector.Element");
goog.provide("acgraph.vector.Element.DirtyState");
goog.require("acgraph.error");
goog.require("acgraph.events");
goog.require("acgraph.events.Dragger");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector");
goog.require("goog.events.EventTarget");
goog.require("goog.events.Listenable");
goog.require("goog.graphics.AffineTransform");
acgraph.vector.Element = function() {
  goog.base(this);
  this.draggable_ = false;
  this.disableStrokeScaling_ = false;
  this.titleElement = null;
  this.titleVal_ = null;
  this.descElement = null;
  this.descVal_ = null;
  this.attributes_ = {};
  this.setDirtyState(acgraph.vector.Element.DirtyState.ALL);
};
goog.inherits(acgraph.vector.Element, goog.events.EventTarget);
acgraph.vector.Element.DirtyState = {DOM_MISSING:1 << 0, VISIBILITY:1 << 1, TRANSFORMATION:1 << 2, FILL:1 << 3, STROKE:1 << 4, DATA:1 << 5, CHILDREN:1 << 6, CHILDREN_SET:1 << 7, PARENT_TRANSFORMATION:1 << 8, CLIP:1 << 9, STYLE:1 << 10, ID:1 << 11, CURSOR:1 << 12, POINTER_EVENTS:1 << 13, POSITION:1 << 14, STROKE_SCALING:1 << 15, TITLE:1 << 16, DESC:1 << 17, ATTRIBUTE:1 << 18, ALL:4294967295};
acgraph.vector.Element.prototype.isRendering_ = false;
acgraph.vector.Element.prototype.cursor_ = null;
acgraph.vector.Element.prototype.parentCursor = null;
acgraph.vector.Element.prototype.domElement_ = null;
acgraph.vector.Element.prototype.parent_ = null;
acgraph.vector.Element.prototype.prevParent_ = null;
acgraph.vector.Element.prototype.visible_ = true;
acgraph.vector.Element.prototype.handler_;
acgraph.vector.Element.prototype.clipElement_ = null;
acgraph.vector.Element.prototype.diablePointerEvents_ = false;
acgraph.vector.Element.prototype.transformation = null;
acgraph.vector.Element.prototype.inverseTransform_ = null;
acgraph.vector.Element.prototype.fullTransform_ = null;
acgraph.vector.Element.prototype.id_ = undefined;
acgraph.vector.Element.prototype.zIndex_ = 0;
acgraph.vector.Element.prototype.tag;
acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Element.DirtyState.DOM_MISSING | acgraph.vector.Element.DirtyState.VISIBILITY | acgraph.vector.Element.DirtyState.CURSOR | acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION | acgraph.vector.Element.DirtyState.TRANSFORMATION | acgraph.vector.Element.DirtyState.CLIP | acgraph.vector.Element.DirtyState.ID | acgraph.vector.Element.DirtyState.POINTER_EVENTS | acgraph.vector.Element.DirtyState.STROKE_SCALING | acgraph.vector.Element.DirtyState.TITLE | 
acgraph.vector.Element.DirtyState.DESC | acgraph.vector.Element.DirtyState.ATTRIBUTE;
acgraph.vector.Element.prototype.dirtyState_ = 0;
acgraph.vector.Element.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var id = opt_value || "";
    if (this.id_ !== id) {
      this.id_ = id;
      this.setDirtyState(acgraph.vector.Element.DirtyState.ID);
    }
    return this;
  }
  if (!goog.isDef(this.id_)) {
    this.id(acgraph.utils.IdGenerator.getInstance().generateId(this));
  }
  return (this.id_);
};
acgraph.vector.Element.prototype.getElementTypePrefix = goog.abstractMethod;
acgraph.vector.Element.prototype.getStage = function() {
  var parent = this.parent();
  return !!parent ? parent.getStage() : null;
};
acgraph.vector.Element.prototype.domElement = function() {
  return this.domElement_;
};
acgraph.vector.Element.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value) {
      var stage = this.getStage();
      var stageChanged = stage != null && stage != opt_value.getStage();
      (opt_value).addChild(this);
      if (stageChanged) {
        this.propagateVisualStatesToChildren_();
      }
    } else {
      this.remove();
    }
    return this;
  }
  return (this.parent_);
};
acgraph.vector.Element.prototype.propagateVisualStatesToChildren_ = function() {
  var numChildren;
  var clip = this.clip();
  if (clip) {
    clip.id(null);
  }
  if (this.numChildren && (numChildren = this.numChildren())) {
    for (var i = 0;i < numChildren;i++) {
      var child = this.getChildAt(i);
      child.propagateVisualStatesToChildren_();
    }
    this.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
  } else {
    this.setDirtyState(acgraph.vector.Element.DirtyState.FILL | acgraph.vector.Element.DirtyState.STROKE | acgraph.vector.Element.DirtyState.CLIP);
  }
};
acgraph.vector.Element.prototype.hasParent = function() {
  return !!this.parent_;
};
acgraph.vector.Element.prototype.remove = function() {
  if (this.hasParent()) {
    this.parent_.removeChild(this);
  }
  return this;
};
acgraph.vector.Element.prototype.getFullChildrenCount = function() {
  return 0;
};
acgraph.vector.Element.prototype.title = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleVal_ != opt_value) {
      this.titleVal_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.TITLE);
    }
    return this;
  }
  return this.titleVal_;
};
acgraph.vector.Element.prototype.desc = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.descVal_ != opt_value) {
      this.descVal_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DESC);
    }
    return this;
  }
  return this.descVal_;
};
acgraph.vector.Element.prototype.attr = function(key, opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.attributes_[key] !== opt_value) {
      this.attributes_[key] = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.ATTRIBUTE);
    }
    return this;
  }
  if (key in this.attributes_) {
    return this.attributes_[key];
  } else {
    return acgraph.getRenderer().getAttribute(this.domElement_, key);
  }
};
acgraph.vector.Element.prototype.cursor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.cursor_ = opt_value;
    this.cursorChanged();
    return this;
  }
  return this.cursor_;
};
acgraph.vector.Element.prototype.cursorChanged = function() {
  this.setDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};
acgraph.vector.Element.prototype.parentCursorChanged = function() {
  this.setDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};
acgraph.vector.Element.prototype.isDirty = function() {
  return !!this.dirtyState_;
};
acgraph.vector.Element.prototype.hasDirtyState = function(state) {
  return !!(this.dirtyState_ & state);
};
acgraph.vector.Element.prototype.setDirtyState = function(value) {
  value &= this.SUPPORTED_DIRTY_STATES;
  if (!!value) {
    this.dirtyState_ |= value;
    if (this.parent_) {
      this.parent_.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
    }
    var stage = this.getStage();
    if (stage && !stage.isSuspended() && !stage.isRendering() && !this.isRendering()) {
      this.render();
    }
  }
};
acgraph.vector.Element.prototype.clearDirtyState = function(value) {
  this.dirtyState_ &= ~value;
};
acgraph.vector.Element.prototype.setParent = function(value) {
  if (!this.parent_ || this.parent_ != value) {
    if (this == value) {
      throw acgraph.error.getErrorMessage(acgraph.error.Code.PARENT_UNABLE_TO_BE_SET);
    }
    if (!this.prevParent_) {
      this.prevParent_ = this.parent_;
    } else {
      if (this.prevParent_ == value) {
        this.prevParent_ = null;
      }
    }
    this.parent_ = value;
    this.setParentEventTarget((value));
  }
  return this;
};
acgraph.vector.Element.prototype.notifyPrevParent = function(doCry) {
  if (this.prevParent_) {
    if (doCry) {
      this.prevParent_.notifyRemoved(this);
    }
    this.prevParent_ = null;
  }
  if (this.isDisposed()) {
    this.finalizeDisposing();
  }
  return this;
};
acgraph.vector.Element.prototype.beforeTransformationChanged = goog.nullFunction;
acgraph.vector.Element.prototype.transformationChanged = function() {
  this.inverseTransform_ = null;
  this.fullTransform_ = null;
  this.dropBoundsCache();
  this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  if (acgraph.getRenderer().needsReClipOnBoundsChange()) {
    if (this.clipElement_) {
      this.clipChanged();
    } else {
      if (this.parent_) {
        this.parent_.childClipChanged();
      }
    }
  }
};
acgraph.vector.Element.prototype.parentTransformationChanged = function() {
  this.fullTransform_ = null;
  this.dropBoundsCache();
  if (acgraph.getRenderer().needsReRenderOnParentTransformationChange()) {
    this.setDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
  }
  if (acgraph.getRenderer().needsReClipOnBoundsChange()) {
    if (this.clipElement_) {
      this.clipChanged();
    } else {
      if (this.parent_) {
        this.parent_.childClipChanged();
      }
    }
  }
};
acgraph.vector.Element.prototype.getInverseTransform = function() {
  if (!this.inverseTransform_) {
    this.inverseTransform_ = this.transformation ? this.transformation.createInverse() : null;
  }
  return this.inverseTransform_;
};
acgraph.vector.Element.prototype.getSelfTransformation = function() {
  return this.transformation;
};
acgraph.vector.Element.prototype.getFullTransformation = function() {
  if (!this.fullTransform_) {
    var parentFullTransformation = this.parent_ ? this.parent_.getFullTransformation() : null;
    this.fullTransform_ = acgraph.math.concatMatrixes(parentFullTransformation, this.transformation);
  }
  return this.fullTransform_;
};
acgraph.vector.Element.prototype.rotate = function(degrees, opt_cx, opt_cy) {
  this.beforeTransformationChanged();
  var rotation = goog.graphics.AffineTransform.getRotateInstance(goog.math.toRadians(degrees), opt_cx || 0, opt_cy || 0);
  if (this.transformation) {
    this.transformation.preConcatenate(rotation);
  } else {
    this.transformation = rotation;
  }
  this.transformationChanged();
  return this;
};
acgraph.vector.Element.prototype.rotateByAnchor = function(degrees, opt_anchor) {
  var point = acgraph.vector.getCoordinateByAnchor(this.getBounds(), opt_anchor || acgraph.vector.Anchor.CENTER);
  return this.rotate(degrees, point[0], point[1]);
};
acgraph.vector.Element.prototype.setRotation = function(degrees, opt_cx, opt_cy) {
  return this.rotate(degrees - this.getRotationAngle(), opt_cx, opt_cy);
};
acgraph.vector.Element.prototype.setRotationByAnchor = function(degrees, opt_anchor) {
  return this.rotateByAnchor(degrees - this.getRotationAngle(), opt_anchor);
};
acgraph.vector.Element.prototype.translate = function(tx, ty) {
  this.beforeTransformationChanged();
  if (this.transformation) {
    this.transformation.translate(tx, ty);
  } else {
    this.transformation = goog.graphics.AffineTransform.getTranslateInstance(tx, ty);
  }
  this.transformationChanged();
  return this;
};
acgraph.vector.Element.prototype.setPosition = function(x, y) {
  var arr = [x, y, this.getX(), this.getY()];
  if (this.transformation) {
    this.getInverseTransform().transform(arr, 0, arr, 0, 2);
  }
  return this.translate(arr[0] - arr[2], arr[1] - arr[3]);
};
acgraph.vector.Element.prototype.setTranslation = function(x, y) {
  this.beforeTransformationChanged();
  if (this.transformation) {
    var oldX = this.transformation.getTranslateX();
    var oldY = this.transformation.getTranslateY();
    if (x == oldX && y == oldY) {
      return this;
    }
    this.transformation.preTranslate(x - oldX, y - oldY);
  } else {
    this.transformation = goog.graphics.AffineTransform.getTranslateInstance(x, y);
  }
  this.transformationChanged();
  return this;
};
acgraph.vector.Element.prototype.scale = function(sx, sy, opt_cx, opt_cy) {
  this.beforeTransformationChanged();
  if (!this.transformation) {
    this.transformation = new goog.graphics.AffineTransform;
  }
  this.transformation.preScale(sx, sy);
  this.transformation.preTranslate((opt_cx || 0) * (1 - sx), (opt_cy || 0) * (1 - sy));
  this.transformationChanged();
  return this;
};
acgraph.vector.Element.prototype.scaleByAnchor = function(sx, sy, opt_anchor) {
  var point = acgraph.vector.getCoordinateByAnchor(this.getBounds(), opt_anchor || acgraph.vector.Anchor.CENTER);
  return this.scale(sx, sy, point[0], point[1]);
};
acgraph.vector.Element.prototype.appendTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.beforeTransformationChanged();
  if (this.transformation) {
    this.transformation.concatenate(new goog.graphics.AffineTransform(m00, m10, m01, m11, m02, m12));
  } else {
    this.transformation = new goog.graphics.AffineTransform(m00, m10, m01, m11, m02, m12);
  }
  this.transformationChanged();
  return this;
};
acgraph.vector.Element.prototype.setTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.beforeTransformationChanged();
  if (this.transformation) {
    this.transformation.setTransform(m00, m10, m01, m11, m02, m12);
  } else {
    this.transformation = new goog.graphics.AffineTransform(m00, m10, m01, m11, m02, m12);
  }
  this.transformationChanged();
  return this;
};
acgraph.vector.Element.prototype.getRotationAngle = function() {
  return acgraph.math.getRotationAngle(this.transformation);
};
acgraph.vector.Element.prototype.getTransformationMatrix = function() {
  if (this.transformation) {
    return [this.transformation.getScaleX(), this.transformation.getShearY(), this.transformation.getShearX(), this.transformation.getScaleY(), this.transformation.getTranslateX(), this.transformation.getTranslateY()];
  } else {
    return [1, 0, 0, 1, 0, 0];
  }
};
acgraph.vector.Element.prototype.createDom = function() {
  var stage = this.getStage();
  if (stage && stage.acquireDomChange(acgraph.vector.Stage.DomChangeType.ELEMENT_CREATE)) {
    this.domElement_ = this.createDomInternal();
    acgraph.register(this);
    this.clearDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING);
  }
};
acgraph.vector.Element.prototype.createDomInternal = function() {
  return null;
};
acgraph.vector.Element.prototype.isRendering = function() {
  return this.isRendering_;
};
acgraph.vector.Element.prototype.render = function() {
  this.isRendering_ = true;
  if (this.isDisposed()) {
    return this;
  }
  var stage = this.getStage();
  if (!stage) {
    return this;
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING)) {
    this.createDom();
    if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING)) {
      return this;
    }
    if (this.draggable_) {
      this.drag(this.draggable_);
    }
  }
  this.renderInternal();
  this.isRendering_ = false;
  return this;
};
acgraph.vector.Element.prototype.renderInternal = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.ATTRIBUTE)) {
    this.renderAttributes();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.VISIBILITY)) {
    this.renderVisibility();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CURSOR)) {
    this.renderCursor();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.POINTER_EVENTS)) {
    this.renderPointerEvents();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION) || this.hasDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION)) {
    this.renderTransformation();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CLIP)) {
    this.renderClip();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.STROKE_SCALING)) {
    acgraph.getRenderer().setDisableStrokeScaling(this, this.disableStrokeScaling_);
    this.clearDirtyState(acgraph.vector.Element.DirtyState.STROKE_SCALING);
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TITLE)) {
    this.renderTitle();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DESC)) {
    this.renderDesc();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.ID)) {
    this.renderId();
  }
};
acgraph.vector.Element.prototype.renderId = function() {
  acgraph.getRenderer().setId(this, this.id_ || "");
  this.clearDirtyState(acgraph.vector.Element.DirtyState.ID);
};
acgraph.vector.Element.prototype.renderVisibility = function() {
  acgraph.getRenderer().setVisible(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.VISIBILITY);
};
acgraph.vector.Element.prototype.renderTransformation = function() {
  acgraph.getRenderer().setTransformation(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};
acgraph.vector.Element.prototype.renderPointerEvents = function() {
  acgraph.getRenderer().setPointerEvents(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.POINTER_EVENTS);
};
acgraph.vector.Element.prototype.renderClip = function() {
  acgraph.getRenderer().setClip(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CLIP);
};
acgraph.vector.Element.prototype.renderCursor = function() {
  acgraph.getRenderer().setCursorProperties(this, this.cursor_ || this.parentCursor);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};
acgraph.vector.Element.prototype.renderTitle = function() {
  acgraph.getRenderer().setTitle(this, this.titleVal_);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TITLE);
};
acgraph.vector.Element.prototype.renderDesc = function() {
  acgraph.getRenderer().setDesc(this, this.descVal_);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DESC);
};
acgraph.vector.Element.prototype.renderAttributes = function() {
  acgraph.getRenderer().setAttributes(this, this.attributes_);
  this.attributes_ = {};
  this.clearDirtyState(acgraph.vector.Element.DirtyState.ATTRIBUTE);
};
acgraph.vector.Element.prototype.setParentEventTarget = function(value) {
  if (this.parent_ && (this.parent_) !== (value)) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.PARENT_UNABLE_TO_BE_SET);
  }
  goog.base(this, "setParentEventTarget", value);
};
acgraph.vector.Element.prototype.disablePointerEvents = function(opt_value) {
  if (!goog.isDef(opt_value)) {
    return this.diablePointerEvents_;
  }
  this.diablePointerEvents_ = !!opt_value;
  this.setDirtyState(acgraph.vector.Element.DirtyState.POINTER_EVENTS);
  return this;
};
acgraph.vector.Element.prototype.dispatchEvent = function(e) {
  if (goog.isString(e)) {
    e = e.toLowerCase();
  } else {
    if ("type" in e) {
      e.type = String(e.type).toLowerCase();
    }
  }
  return goog.base(this, "dispatchEvent", e);
};
acgraph.vector.Element.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return (goog.base(this, "listen", String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};
acgraph.vector.Element.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return (goog.base(this, "listenOnce", String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};
acgraph.vector.Element.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return goog.base(this, "unlisten", String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};
acgraph.vector.Element.prototype.unlistenByKey;
acgraph.vector.Element.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) {
    opt_type = String(opt_type).toLowerCase();
  }
  return goog.base(this, "removeAllListeners", opt_type);
};
acgraph.vector.Element.prototype.zIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = +opt_value || 0;
    if (this.zIndex_ != val) {
      this.zIndex_ = val;
      if (this.parent_) {
        this.parent_.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
      }
    }
    return this;
  }
  return this.zIndex_ || 0;
};
acgraph.vector.Element.prototype.visible = function(opt_isVisible) {
  if (arguments.length == 0) {
    return this.visible_;
  }
  if (this.visible_ != opt_isVisible) {
    this.visible_ = goog.isDefAndNotNull(opt_isVisible) ? opt_isVisible : true;
    this.setDirtyState(acgraph.vector.Element.DirtyState.VISIBILITY);
  }
  return this;
};
acgraph.vector.Element.prototype.disableStrokeScaling = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.disableStrokeScaling_ != opt_value) {
      this.disableStrokeScaling_ = goog.isDefAndNotNull(opt_value) ? opt_value : true;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE_SCALING);
    }
    return this;
  }
  return this.disableStrokeScaling_;
};
acgraph.vector.Element.prototype.clip = function(opt_value) {
  if (arguments.length == 0) {
    return this.clipElement_;
  }
  var clipShape = (opt_value == "none" ? null : opt_value);
  if (!this.clipElement_ && !clipShape || this.clipElement_ && this.clipElement_ === clipShape) {
    return this;
  }
  if (clipShape && !(clipShape instanceof acgraph.vector.Clip)) {
    if (clipShape instanceof acgraph.vector.Shape && clipShape.hasParent() && clipShape.parent() instanceof acgraph.vector.Clip) {
      if (this.clipElement_ && !this.clipElement_.isDisposed()) {
        this.clipElement_.removeElement(this);
      }
      this.clipElement_ = (clipShape.parent());
      this.clipElement_.addElement(this);
    } else {
      if (this.clipElement_) {
        this.clipElement_.shape(clipShape);
      } else {
        this.clipElement_ = acgraph.clip(clipShape);
        this.clipElement_.addElement(this);
      }
    }
  } else {
    this.clipElement_ = clipShape || null;
  }
  this.clipChanged();
  return this;
};
acgraph.vector.Element.prototype.clipChanged = function() {
  if (this.parent_) {
    this.parent_.childClipChanged();
  }
  this.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
};
acgraph.vector.Element.prototype.boundsCache = null;
acgraph.vector.Element.prototype.getX = function() {
  var bounds = this.boundsCache || this.getBounds();
  return bounds.left;
};
acgraph.vector.Element.prototype.getY = function() {
  var bounds = this.boundsCache || this.getBounds();
  return bounds.top;
};
acgraph.vector.Element.prototype.getWidth = function() {
  var bounds = this.boundsCache || this.getBounds();
  return bounds.width;
};
acgraph.vector.Element.prototype.getHeight = function() {
  var bounds = this.boundsCache || this.getBounds();
  return bounds.height;
};
acgraph.vector.Element.prototype.getBounds = function() {
  return this.getBoundsWithTransform(this.getSelfTransformation());
};
acgraph.vector.Element.prototype.absoluteBoundsCache = null;
acgraph.vector.Element.prototype.getAbsoluteX = function() {
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.left;
};
acgraph.vector.Element.prototype.getAbsoluteY = function() {
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.top;
};
acgraph.vector.Element.prototype.getAbsoluteWidth = function() {
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.width;
};
acgraph.vector.Element.prototype.getAbsoluteHeight = function() {
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.height;
};
acgraph.vector.Element.prototype.getAbsoluteBounds = function() {
  return this.getBoundsWithTransform(this.getFullTransformation());
};
acgraph.vector.Element.prototype.getBoundsWithTransform = goog.abstractMethod;
acgraph.vector.Element.prototype.getBoundsWithoutTransform = function() {
  return this.getBoundsWithTransform(null);
};
acgraph.vector.Element.prototype.dropBoundsCache = function() {
  this.boundsCache = null;
  this.absoluteBoundsCache = null;
};
acgraph.vector.Element.prototype.drag = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.draggable_ = opt_value;
    if (opt_value && !this.hasDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING)) {
      var isLimited = opt_value instanceof acgraph.math.Rect;
      var limit = isLimited ? this.draggable_ : null;
      var dragger = this.dragger_ ? this.dragger_ : this.dragger_ = new acgraph.events.Dragger(this);
      dragger.enabled(true);
      dragger.setLimits(limit);
    } else {
      if (this.dragger_) {
        this.dragger_.enabled(false);
      }
    }
    return this;
  }
  return this.draggable_;
};
acgraph.vector.Element.prototype.deserialize = function(data) {
  if ("id" in data) {
    this.id(data["id"]);
  }
  if ("clip" in data) {
    var clip = acgraph.clip();
    clip.deserialize(data["clip"]);
    this.clip(clip);
  }
  if ("drag" in data) {
    var drag = data["drag"];
    this.drag(goog.isBoolean(drag) ? drag : new acgraph.math.Rect(drag.left, drag.top, drag.width, drag.height));
  }
  if ("cursor" in data) {
    this.cursor(data["cursor"]);
  }
  if ("transformation" in data) {
    var tx = data["transformation"];
    this.setTransformationMatrix.apply(this, tx);
  }
};
acgraph.vector.Element.prototype.serialize = function() {
  var data = {};
  if (this.id_) {
    data["id"] = this.id_;
  }
  var clip = this.clip();
  if (clip) {
    data["clip"] = clip.serialize();
  }
  var cursor = this.cursor();
  if (cursor) {
    data["cursor"] = cursor;
  }
  var drag = this.drag();
  if (drag) {
    data["drag"] = drag;
  }
  var tx = this.getSelfTransformation();
  if (tx) {
    data["transformation"] = [tx.getScaleX(), tx.getShearY(), tx.getShearX(), tx.getScaleX(), tx.getTranslateX(), tx.getTranslateY()];
  }
  return data;
};
acgraph.vector.Element.prototype.dispose = function() {
  goog.base(this, "dispose");
};
acgraph.vector.Element.prototype.disposeInternal = function() {
  if (this.hasParent()) {
    this.remove();
  } else {
    this.finalizeDisposing();
  }
  goog.base(this, "disposeInternal");
};
acgraph.vector.Element.prototype.finalizeDisposing = function() {
  goog.dispose(this.handler_);
  this.handler_ = null;
  this.setParent(null);
  acgraph.unregister(this);
  this.domElement_ = null;
  this.skew = null;
  this.clipElement_ = null;
  this.transformation = null;
  this.logicalTransformation = null;
  this.inverseTransform_ = null;
};
acgraph.vector.Element.prototype["id"] = acgraph.vector.Element.prototype.id;
acgraph.vector.Element.prototype["visible"] = acgraph.vector.Element.prototype.visible;
acgraph.vector.Element.prototype["disableStrokeScaling"] = acgraph.vector.Element.prototype.disableStrokeScaling;
acgraph.vector.Element.prototype["domElement"] = acgraph.vector.Element.prototype.domElement;
acgraph.vector.Element.prototype["parent"] = acgraph.vector.Element.prototype.parent;
acgraph.vector.Element.prototype["hasParent"] = acgraph.vector.Element.prototype.hasParent;
acgraph.vector.Element.prototype["remove"] = acgraph.vector.Element.prototype.remove;
acgraph.vector.Element.prototype["attr"] = acgraph.vector.Element.prototype.attr;
acgraph.vector.Element.prototype["title"] = acgraph.vector.Element.prototype.title;
acgraph.vector.Element.prototype["desc"] = acgraph.vector.Element.prototype.desc;
acgraph.vector.Element.prototype["getStage"] = acgraph.vector.Element.prototype.getStage;
acgraph.vector.Element.prototype["cursor"] = acgraph.vector.Element.prototype.cursor;
acgraph.vector.Element.prototype["disablePointerEvents"] = acgraph.vector.Element.prototype.disablePointerEvents;
acgraph.vector.Element.prototype["rotate"] = acgraph.vector.Element.prototype.rotate;
acgraph.vector.Element.prototype["rotateByAnchor"] = acgraph.vector.Element.prototype.rotateByAnchor;
acgraph.vector.Element.prototype["setRotation"] = acgraph.vector.Element.prototype.setRotation;
acgraph.vector.Element.prototype["setRotationByAnchor"] = acgraph.vector.Element.prototype.setRotationByAnchor;
acgraph.vector.Element.prototype["translate"] = acgraph.vector.Element.prototype.translate;
acgraph.vector.Element.prototype["setTranslation"] = acgraph.vector.Element.prototype.setTranslation;
acgraph.vector.Element.prototype["setPosition"] = acgraph.vector.Element.prototype.setPosition;
acgraph.vector.Element.prototype["scale"] = acgraph.vector.Element.prototype.scale;
acgraph.vector.Element.prototype["scaleByAnchor"] = acgraph.vector.Element.prototype.scaleByAnchor;
acgraph.vector.Element.prototype["appendTransformationMatrix"] = acgraph.vector.Element.prototype.appendTransformationMatrix;
acgraph.vector.Element.prototype["setTransformationMatrix"] = acgraph.vector.Element.prototype.setTransformationMatrix;
acgraph.vector.Element.prototype["getRotationAngle"] = acgraph.vector.Element.prototype.getRotationAngle;
acgraph.vector.Element.prototype["getTransformationMatrix"] = acgraph.vector.Element.prototype.getTransformationMatrix;
acgraph.vector.Element.prototype["clip"] = acgraph.vector.Element.prototype.clip;
acgraph.vector.Element.prototype["zIndex"] = acgraph.vector.Element.prototype.zIndex;
acgraph.vector.Element.prototype["getX"] = acgraph.vector.Element.prototype.getX;
acgraph.vector.Element.prototype["getY"] = acgraph.vector.Element.prototype.getY;
acgraph.vector.Element.prototype["getWidth"] = acgraph.vector.Element.prototype.getWidth;
acgraph.vector.Element.prototype["getHeight"] = acgraph.vector.Element.prototype.getHeight;
acgraph.vector.Element.prototype["getBounds"] = acgraph.vector.Element.prototype.getBounds;
acgraph.vector.Element.prototype["getAbsoluteX"] = acgraph.vector.Element.prototype.getAbsoluteX;
acgraph.vector.Element.prototype["getAbsoluteY"] = acgraph.vector.Element.prototype.getAbsoluteY;
acgraph.vector.Element.prototype["getAbsoluteWidth"] = acgraph.vector.Element.prototype.getAbsoluteWidth;
acgraph.vector.Element.prototype["getAbsoluteHeight"] = acgraph.vector.Element.prototype.getAbsoluteHeight;
acgraph.vector.Element.prototype["getAbsoluteBounds"] = acgraph.vector.Element.prototype.getAbsoluteBounds;
acgraph.vector.Element.prototype["listen"] = acgraph.vector.Element.prototype.listen;
acgraph.vector.Element.prototype["listenOnce"] = acgraph.vector.Element.prototype.listenOnce;
acgraph.vector.Element.prototype["unlisten"] = acgraph.vector.Element.prototype.unlisten;
acgraph.vector.Element.prototype["unlistenByKey"] = acgraph.vector.Element.prototype.unlistenByKey;
acgraph.vector.Element.prototype["removeAllListeners"] = acgraph.vector.Element.prototype.removeAllListeners;
acgraph.vector.Element.prototype["drag"] = acgraph.vector.Element.prototype.drag;
acgraph.vector.Element.prototype["dispose"] = acgraph.vector.Element.prototype.dispose;
goog.provide("acgraph.vector.UnmanagedLayer");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Element");
acgraph.vector.UnmanagedLayer = function(opt_content) {
  goog.base(this);
  this.content_ = goog.isDef(opt_content) ? opt_content : "";
};
goog.inherits(acgraph.vector.UnmanagedLayer, acgraph.vector.Element);
acgraph.vector.UnmanagedLayer.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.UNMANAGEABLE_LAYER;
};
acgraph.vector.UnmanagedLayer.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.DATA;
acgraph.vector.UnmanagedLayer.prototype.content = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.content_) {
      this.content_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.content_;
};
acgraph.vector.UnmanagedLayer.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createLayerElement();
};
acgraph.vector.UnmanagedLayer.prototype.renderInternal = function() {
  goog.base(this, "renderInternal");
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    var domelement = this.domElement();
    goog.dom.removeChildren(domelement);
    if (goog.isString(this.content_)) {
      domelement.innerHTML = this.content_;
    } else {
      goog.dom.appendChild(domelement, this.content_);
    }
    this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }
};
acgraph.vector.UnmanagedLayer.prototype.getBoundsWithTransform = function(transform) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform) {
    return this.boundsCache.clone();
  } else {
    if (this.absoluteBoundsCache && isFullTransform) {
      return this.absoluteBoundsCache.clone();
    } else {
      var bounds = acgraph.getRenderer().measureElement(this.content_);
      if (transform) {
        bounds = acgraph.math.getBoundsOfRectWithTransform(bounds, transform);
      }
      if (isSelfTransform) {
        this.boundsCache = bounds.clone();
      }
      if (isFullTransform) {
        this.absoluteBoundsCache = bounds.clone();
      }
      return bounds;
    }
  }
};
acgraph.vector.UnmanagedLayer.prototype.deserialize = function(data) {
  if ("content" in data) {
    this.content(data["content"]);
  }
  goog.base(this, "deserialize", data);
};
acgraph.vector.UnmanagedLayer.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  data["content"] = goog.isString(this.content_) ? this.content_ : this.content_.outerHTML;
  return data;
};
acgraph.vector.UnmanagedLayer.prototype["content"] = acgraph.vector.UnmanagedLayer.prototype.content;
goog.provide("acgraph.vector.Layer");
goog.require("acgraph.error");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Element");
goog.require("acgraph.vector.ILayer");
acgraph.vector.Layer = function() {
  this.children = [];
  this.domChildren = [];
  goog.base(this);
};
goog.inherits(acgraph.vector.Layer, acgraph.vector.Element);
acgraph.vector.Layer.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.LAYER;
};
acgraph.vector.Layer.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.CHILDREN | acgraph.vector.Element.DirtyState.CHILDREN_SET | acgraph.vector.Element.DirtyState.DATA;
acgraph.vector.Layer.prototype.setDirtyState = function(value) {
  goog.base(this, "setDirtyState", value);
  if (!!(value & (acgraph.vector.Element.DirtyState.CHILDREN | acgraph.vector.Element.DirtyState.CHILDREN_SET))) {
    this.dropBoundsCache();
  }
};
acgraph.vector.Layer.prototype.addChild = function(element) {
  return this.addChildAt(element, this.numChildren());
};
acgraph.vector.Layer.prototype.addChildAt = function(element, index) {
  element.remove();
  index = goog.math.clamp(index, 0, this.numChildren());
  goog.array.insertAt(this.children, element, index);
  element.setParent(this);
  if (element.isDirty()) {
    this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
  }
  this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  element.parentTransformationChanged();
  if (this.cursor() || this.parentCursor) {
    element.parentCursorChanged();
    element.parentCursor = (this.cursor() || this.parentCursor);
  }
  return this;
};
acgraph.vector.Layer.prototype.getChildAt = function(index) {
  return this.children[index] || null;
};
acgraph.vector.Layer.prototype.indexOfChild = function(element) {
  return goog.array.indexOf(this.children, element);
};
acgraph.vector.Layer.prototype.removeChild = function(element) {
  return this.removeChildAt(this.indexOfChild(element));
};
acgraph.vector.Layer.prototype.removeChildAt = function(index) {
  var element = null;
  if (index >= 0 && index < this.numChildren()) {
    if (this.isDisposed()) {
      element = this.children[index];
    } else {
      element = goog.array.splice(this.children, index, 1)[0];
    }
    element.setParent(null);
    this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  }
  return element;
};
acgraph.vector.Layer.prototype.removeChildren = function() {
  for (var i = 0;i < this.numChildren();i++) {
    var element = this.children[i];
    element.setParent(null);
  }
  var result = this.children;
  if (!this.isDisposed()) {
    this.children = [];
  }
  this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  return result;
};
acgraph.vector.Layer.prototype.swapChildren = function(element1, element2) {
  return this.swapChildrenAt(this.indexOfChild(element1), this.indexOfChild(element2));
};
acgraph.vector.Layer.prototype.swapChildrenAt = function(index1, index2) {
  if (index1 < 0 || index1 >= this.numChildren() || index2 < 0 || index2 >= this.numChildren()) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.WRONG_SWAPPING);
  }
  if (index1 != index2) {
    var element = this.children[index1];
    this.children[index1] = this.children[index2];
    this.children[index2] = element;
    this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  }
  return this;
};
acgraph.vector.Layer.prototype.hasChild = function(element) {
  return !!element && goog.array.contains(this.children, element);
};
acgraph.vector.Layer.prototype.numChildren = function() {
  return this.children.length;
};
acgraph.vector.Layer.prototype.forEachChild = function(callback, opt_this) {
  if (!goog.isDef(opt_this)) {
    opt_this = this;
  }
  goog.array.forEach(this.children, callback, opt_this);
  return this;
};
acgraph.vector.Layer.prototype.layer = function() {
  var layer = acgraph.layer();
  layer.parent(this);
  return layer;
};
acgraph.vector.Layer.prototype.unmanagedLayer = function() {
  var layer = acgraph.unmanagedLayer();
  layer.parent(this);
  return layer;
};
acgraph.vector.Layer.prototype.text = function(opt_x, opt_y, opt_text, opt_style) {
  var text = acgraph.text(opt_x, opt_y);
  if (opt_style) {
    text.style(opt_style);
  }
  if (opt_text) {
    text.text(opt_text);
  }
  text.parent(this);
  return text;
};
acgraph.vector.Layer.prototype.html = function(opt_x, opt_y, opt_text, opt_style) {
  var text = acgraph.text(opt_x, opt_y);
  if (opt_style) {
    text.style(opt_style);
  }
  if (opt_text) {
    text.htmlText(opt_text);
  }
  text.parent(this);
  return text;
};
acgraph.vector.Layer.prototype.rect = function(opt_x, opt_y, opt_width, opt_height) {
  var rect = acgraph.rect(opt_x, opt_y, opt_width, opt_height);
  rect.parent(this);
  return rect;
};
acgraph.vector.Layer.prototype.image = function(opt_src, opt_x, opt_y, opt_width, opt_height) {
  var image = acgraph.image(opt_src, opt_x, opt_y, opt_width, opt_height);
  image.parent(this);
  return image;
};
acgraph.vector.Layer.prototype.roundedRect = function(rect, var_args) {
  goog.array.insertAt(arguments, this.path(), 0);
  return (acgraph.vector.primitives.roundedRect.apply(this, arguments).parent(this));
};
acgraph.vector.Layer.prototype.roundedInnerRect = function(rect, var_args) {
  goog.array.insertAt(arguments, this.path(), 0);
  return (acgraph.vector.primitives.roundedInnerRect.apply(this, arguments).parent(this));
};
acgraph.vector.Layer.prototype.truncatedRect = function(rect, var_args) {
  goog.array.insertAt(arguments, this.path(), 0);
  return (acgraph.vector.primitives.truncatedRect.apply(this, arguments).parent(this));
};
acgraph.vector.Layer.prototype.circle = function(opt_cx, opt_cy, opt_radius) {
  var circle = acgraph.circle(opt_cx, opt_cy, opt_radius);
  circle.parent(this);
  return circle;
};
acgraph.vector.Layer.prototype.ellipse = function(opt_cx, opt_cy, opt_rx, opt_ry) {
  var ellipse = acgraph.ellipse(opt_cx, opt_cy, opt_rx, opt_ry);
  ellipse.parent(this);
  return ellipse;
};
acgraph.vector.Layer.prototype.path = function() {
  return (acgraph.path().parent(this));
};
acgraph.vector.Layer.prototype.star = function(centerX, centerY, outerRadius, innerRadius, numberOfSpikes, opt_startDegrees, opt_curvature) {
  return (acgraph.vector.primitives.star(this.path(), centerX, centerY, outerRadius, innerRadius, numberOfSpikes, opt_startDegrees, opt_curvature).parent(this));
};
acgraph.vector.Layer.prototype.star4 = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.star4(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.star5 = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.star5(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.star6 = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.star6(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.star7 = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.star7(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.star10 = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.star10(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.triangleUp = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.triangleUp(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.triangleDown = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.triangleDown(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.triangleRight = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.triangleRight(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.triangleLeft = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.triangleLeft(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.diamond = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.diamond(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.cross = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.cross(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.diagonalCross = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.diagonalCross(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.hLine = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.hLine(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.vLine = function(centerX, centerY, outerRadius) {
  return (acgraph.vector.primitives.vLine(this.path(), centerX, centerY, outerRadius).parent(this));
};
acgraph.vector.Layer.prototype.pie = function(cx, cy, r, start, extent) {
  return (acgraph.vector.primitives.pie(this.path(), cx, cy, r, start, extent).parent(this));
};
acgraph.vector.Layer.prototype.donut = function(cx, cy, outerR, innerR, start, extent) {
  return (acgraph.vector.primitives.donut(this.path(), cx, cy, outerR, innerR, start, extent).parent(this));
};
acgraph.vector.Layer.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createLayerElement();
};
acgraph.vector.Layer.prototype.renderInternal = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    this.renderData();
  }
  var halfLimit = this.getStage().blockChangesForAdding();
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CHILDREN)) {
    this.renderChildren();
  }
  this.getStage().releaseDomChanges(halfLimit, 0);
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET)) {
    var allowedChangesCount = this.getStage().acquireDomChanges(this.children.length + this.domChildren.length + 1);
    var changesMade = this.renderChildrenDom(allowedChangesCount);
    if (changesMade < allowedChangesCount) {
      this.getStage().releaseDomChanges(allowedChangesCount, changesMade);
    }
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CHILDREN)) {
    this.renderChildren();
  }
  goog.base(this, "renderInternal");
};
acgraph.vector.Layer.prototype.cursorChanged = function() {
  goog.base(this, "cursorChanged");
  this.propagateCursor();
};
acgraph.vector.Layer.prototype.parentCursorChanged = function() {
  goog.base(this, "parentCursorChanged");
  this.propagateCursor();
};
acgraph.vector.Layer.prototype.propagateCursor = function() {
  for (var i = this.children.length;i--;) {
    this.children[i].parentCursorChanged();
    this.children[i].parentCursor = (this.cursor() || this.parentCursor);
  }
};
acgraph.vector.Layer.prototype.renderCursor = function() {
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};
acgraph.vector.Layer.prototype.renderChildren = function() {
  var needsReRender = goog.array.reduce(this.children, function(previousValue, child) {
    if (child.isDirty()) {
      child.render();
    }
    return previousValue || child.isDirty();
  }, false);
  if (!needsReRender) {
    this.clearDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
  }
};
acgraph.vector.Layer.prototype.renderChildrenDom = function(maxChanges) {
  var domElement = this.domElement();
  var child, domChild, i, len, j, jLen, changesMade = 0;
  if (!this.expectedChidrenHash_) {
    this.expectedChidrenHash_ = {};
    for (i = 0, len = this.children.length;i < len;i++) {
      this.expectedChidrenHash_[goog.getUid(this.children[i])] = true;
    }
  }
  var flagAdded = false;
  var flagSuccess = true;
  var addings = [];
  var removings = [];
  var renderer = acgraph.getRenderer();
  var add = function(child) {
    var childDom = child.domElement();
    if (childDom) {
      renderer.appendChild(domElement, childDom);
      changesMade++;
      addings.push(i);
      child.notifyPrevParent(true);
    } else {
      flagSuccess = false;
    }
    return !!domElement;
  };
  var remove = function(child) {
    var childDom = child.domElement();
    if (childDom) {
      renderer.removeNode(childDom);
      changesMade++;
    }
    child.notifyPrevParent(false);
    removings.push(j);
  };
  var childrenOk = true;
  for (i = 0, len = this.children.length - 1;i < len;i++) {
    if (this.children[i + 1].zIndex() < this.children[i].zIndex()) {
      childrenOk = false;
      break;
    }
  }
  var children;
  if (childrenOk) {
    children = this.children;
  } else {
    children = goog.array.clone(this.children);
    goog.array.stableSort(children, function(a, b) {
      return a.zIndex() - b.zIndex();
    });
  }
  for (i = 0, len = children.length, j = 0, jLen = this.domChildren.length;i < len && j < jLen && changesMade < maxChanges;j++) {
    child = children[i];
    domChild = this.domChildren[j];
    if (goog.getUid(domChild) in this.expectedChidrenHash_) {
      if (domChild != child || flagAdded) {
        if (!add(child)) {
          break;
        }
        flagAdded = true;
      }
      i++;
    } else {
      remove(domChild);
    }
  }
  if (changesMade >= maxChanges) {
    flagSuccess = false;
  }
  if (flagSuccess) {
    for (;i < len && changesMade < maxChanges;i++) {
      if (!add(children[i])) {
        break;
      }
    }
    for (;j < jLen && changesMade < maxChanges;j++) {
      remove(this.domChildren[j]);
    }
    if (i < len || j < jLen) {
      flagSuccess = false;
    }
  }
  if (flagSuccess) {
    this.domChildren = goog.array.slice(children, 0);
    this.expectedChidrenHash_ = null;
    this.clearDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  } else {
    for (i = removings.length;i--;) {
      goog.array.splice(this.domChildren, removings[i], 1);
    }
    for (i = 0;i < addings.length;i++) {
      this.domChildren.push(children[addings[i]]);
    }
  }
  return changesMade;
};
acgraph.vector.Layer.prototype.notifyRemoved = function(child) {
  if (this.isDisposed()) {
    return;
  }
  var index = goog.array.indexOf(this.domChildren, child);
  if (index >= 0) {
    goog.array.splice(this.domChildren, index, 1);
  }
};
acgraph.vector.Layer.prototype.renderData = function() {
  acgraph.getRenderer().setLayerSize(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};
acgraph.vector.Layer.prototype.renderTransformation = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION)) {
    acgraph.getRenderer().setLayerTransformation(this);
  }
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};
acgraph.vector.Layer.prototype.getBoundsWithTransform = function(transform) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform) {
    return this.boundsCache.clone();
  } else {
    if (this.absoluteBoundsCache && isFullTransform) {
      return this.absoluteBoundsCache.clone();
    } else {
      var bounds = null;
      for (var i = 0, len = this.children.length;i < len;i++) {
        var child = this.children[i];
        var childBounds = child.getBoundsWithTransform(acgraph.math.concatMatrixes(transform, child.getSelfTransformation()));
        if (!isNaN(childBounds.left) && !isNaN(childBounds.top) && !isNaN(childBounds.width) && !isNaN(childBounds.height)) {
          if (bounds) {
            bounds.boundingRect(childBounds);
          } else {
            bounds = childBounds;
          }
        }
      }
      if (!bounds) {
        bounds = acgraph.math.getBoundsOfRectWithTransform(new acgraph.math.Rect(0, 0, 0, 0), transform);
      }
      if (isSelfTransform) {
        this.boundsCache = bounds.clone();
      }
      if (isFullTransform) {
        this.absoluteBoundsCache = bounds.clone();
      }
      return bounds;
    }
  }
};
acgraph.vector.Layer.prototype.beforeTransformationChanged = function() {
  for (var i = this.children.length;i--;) {
    this.children[i].beforeTransformationChanged();
  }
};
acgraph.vector.Layer.prototype.transformationChanged = function() {
  goog.base(this, "transformationChanged");
  this.propagateTransform();
};
acgraph.vector.Layer.prototype.parentTransformationChanged = function() {
  goog.base(this, "parentTransformationChanged");
  this.propagateTransform();
};
acgraph.vector.Layer.prototype.propagateTransform = function() {
  for (var i = this.children.length;i--;) {
    this.children[i].parentTransformationChanged();
  }
};
acgraph.vector.Layer.prototype.childClipChanged = function() {
  if (acgraph.getRenderer().needsReClipOnBoundsChange()) {
    this.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
    if (this.hasParent()) {
      this.parent().childClipChanged();
    }
  }
};
acgraph.vector.Layer.prototype.deserialize = function(data) {
  var children = data["children"];
  goog.array.forEach(children, function(item) {
    var type = item["type"];
    var primitive;
    switch(type) {
      case "rect":
        primitive = this.rect();
        break;
      case "circle":
        primitive = this.circle();
        break;
      case "ellipse":
        primitive = this.ellipse();
        break;
      case "image":
        primitive = this.image();
        break;
      case "text":
        primitive = this.text();
        break;
      case "path":
        primitive = this.path();
        break;
      case "layer":
        primitive = this.layer();
        break;
      default:
        primitive = null;
        break;
    }
    if (primitive) {
      primitive.deserialize(item);
    }
  }, this);
  goog.base(this, "deserialize", data);
};
acgraph.vector.Layer.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  var childrenData = [];
  this.forEachChild(function(child) {
    childrenData.push(child.serialize());
  });
  data["type"] = "layer";
  data["children"] = childrenData;
  return data;
};
acgraph.vector.Layer.prototype.disposeInternal = function() {
  if (this.children) {
    goog.disposeAll.apply(null, this.children);
  }
  if (this.domChildren) {
    delete this.domChildren;
  }
  this.dropBoundsCache();
  goog.base(this, "disposeInternal");
};
acgraph.vector.Layer.prototype.finalizeDisposing = function() {
  delete this.domChildren;
  delete this.children;
  goog.base(this, "finalizeDisposing");
};
goog.exportSymbol("acgraph.vector.Layer", acgraph.vector.Layer);
acgraph.vector.Layer.prototype["addChild"] = acgraph.vector.Layer.prototype.addChild;
acgraph.vector.Layer.prototype["addChildAt"] = acgraph.vector.Layer.prototype.addChildAt;
acgraph.vector.Layer.prototype["removeChild"] = acgraph.vector.Layer.prototype.removeChild;
acgraph.vector.Layer.prototype["removeChildAt"] = acgraph.vector.Layer.prototype.removeChildAt;
acgraph.vector.Layer.prototype["removeChildren"] = acgraph.vector.Layer.prototype.removeChildren;
acgraph.vector.Layer.prototype["swapChildren"] = acgraph.vector.Layer.prototype.swapChildren;
acgraph.vector.Layer.prototype["swapChildrenAt"] = acgraph.vector.Layer.prototype.swapChildrenAt;
acgraph.vector.Layer.prototype["getChildAt"] = acgraph.vector.Layer.prototype.getChildAt;
acgraph.vector.Layer.prototype["hasChild"] = acgraph.vector.Layer.prototype.hasChild;
acgraph.vector.Layer.prototype["forEachChild"] = acgraph.vector.Layer.prototype.forEachChild;
acgraph.vector.Layer.prototype["indexOfChild"] = acgraph.vector.Layer.prototype.indexOfChild;
acgraph.vector.Layer.prototype["numChildren"] = acgraph.vector.Layer.prototype.numChildren;
acgraph.vector.Layer.prototype["circle"] = acgraph.vector.Layer.prototype.circle;
acgraph.vector.Layer.prototype["layer"] = acgraph.vector.Layer.prototype.layer;
acgraph.vector.Layer.prototype["unmanagedLayer"] = acgraph.vector.Layer.prototype.unmanagedLayer;
acgraph.vector.Layer.prototype["ellipse"] = acgraph.vector.Layer.prototype.ellipse;
acgraph.vector.Layer.prototype["rect"] = acgraph.vector.Layer.prototype.rect;
acgraph.vector.Layer.prototype["truncatedRect"] = acgraph.vector.Layer.prototype.truncatedRect;
acgraph.vector.Layer.prototype["roundedRect"] = acgraph.vector.Layer.prototype.roundedRect;
acgraph.vector.Layer.prototype["roundedInnerRect"] = acgraph.vector.Layer.prototype.roundedInnerRect;
acgraph.vector.Layer.prototype["path"] = acgraph.vector.Layer.prototype.path;
acgraph.vector.Layer.prototype["star"] = acgraph.vector.Layer.prototype.star;
acgraph.vector.Layer.prototype["star4"] = acgraph.vector.Layer.prototype.star4;
acgraph.vector.Layer.prototype["star5"] = acgraph.vector.Layer.prototype.star5;
acgraph.vector.Layer.prototype["star6"] = acgraph.vector.Layer.prototype.star6;
acgraph.vector.Layer.prototype["star7"] = acgraph.vector.Layer.prototype.star7;
acgraph.vector.Layer.prototype["star10"] = acgraph.vector.Layer.prototype.star10;
acgraph.vector.Layer.prototype["diamond"] = acgraph.vector.Layer.prototype.diamond;
acgraph.vector.Layer.prototype["triangleUp"] = acgraph.vector.Layer.prototype.triangleUp;
acgraph.vector.Layer.prototype["triangleDown"] = acgraph.vector.Layer.prototype.triangleDown;
acgraph.vector.Layer.prototype["triangleRight"] = acgraph.vector.Layer.prototype.triangleRight;
acgraph.vector.Layer.prototype["triangleLeft"] = acgraph.vector.Layer.prototype.triangleLeft;
acgraph.vector.Layer.prototype["cross"] = acgraph.vector.Layer.prototype.cross;
acgraph.vector.Layer.prototype["diagonalCross"] = acgraph.vector.Layer.prototype.diagonalCross;
acgraph.vector.Layer.prototype["hLine"] = acgraph.vector.Layer.prototype.hLine;
acgraph.vector.Layer.prototype["vLine"] = acgraph.vector.Layer.prototype.vLine;
acgraph.vector.Layer.prototype["pie"] = acgraph.vector.Layer.prototype.pie;
acgraph.vector.Layer.prototype["donut"] = acgraph.vector.Layer.prototype.donut;
acgraph.vector.Layer.prototype["text"] = acgraph.vector.Layer.prototype.text;
acgraph.vector.Layer.prototype["html"] = acgraph.vector.Layer.prototype.html;
acgraph.vector.Layer.prototype["image"] = acgraph.vector.Layer.prototype.image;
goog.provide("acgraph.vector.PatternFill");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Layer");
acgraph.vector.PatternFill = function(bounds) {
  this.bounds = bounds;
  this.rendered = false;
  goog.base(this);
};
goog.inherits(acgraph.vector.PatternFill, acgraph.vector.Layer);
acgraph.vector.PatternFill.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Element.DirtyState.DOM_MISSING | acgraph.vector.Element.DirtyState.TRANSFORMATION | acgraph.vector.Element.DirtyState.ID | acgraph.vector.Element.DirtyState.CHILDREN | acgraph.vector.Element.DirtyState.CHILDREN_SET | acgraph.vector.Element.DirtyState.DATA;
acgraph.vector.PatternFill.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.FILL_PATTERN;
};
acgraph.vector.PatternFill.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value) {
      this.setParent(opt_value);
    } else {
      this.remove();
    }
    return this;
  }
  return goog.base(this, "parent");
};
acgraph.vector.PatternFill.prototype.getBoundsWithoutTransform = function() {
  return this.bounds.clone();
};
acgraph.vector.PatternFill.prototype.getBoundsWithTransform = function(transform) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform) {
    return this.boundsCache.clone();
  } else {
    if (this.absoluteBoundsCache && isFullTransform) {
      return this.absoluteBoundsCache.clone();
    } else {
      var bounds = acgraph.math.getBoundsOfRectWithTransform(this.bounds.clone(), transform);
      if (isSelfTransform) {
        this.boundsCache = bounds.clone();
      }
      if (isFullTransform) {
        this.absoluteBoundsCache = bounds.clone();
      }
      return bounds;
    }
  }
};
acgraph.vector.PatternFill.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createFillPatternElement();
};
acgraph.vector.PatternFill.prototype.renderData = function() {
  acgraph.getRenderer().setFillPatternProperties(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};
acgraph.vector.PatternFill.prototype.renderInternal = function() {
  if (!this.rendered) {
    goog.dom.appendChild(this.getStage().getDefs().domElement(), this.domElement());
  }
  this.rendered = true;
  goog.base(this, "renderInternal");
};
acgraph.vector.PatternFill.prototype.renderTransformation = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION)) {
    acgraph.getRenderer().setPatternTransformation(this);
  }
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
};
acgraph.vector.PatternFill.prototype.deserialize = function(data) {
  goog.base(this, "deserialize", data);
};
acgraph.vector.PatternFill.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  var bounds = this.getBoundsWithoutTransform();
  data["type"] = "pattern";
  data["bounds"] = bounds;
  return data;
};
acgraph.vector.PatternFill.prototype.disposeInternal = function() {
  acgraph.getRenderer().removeNode(this.domElement());
  this.bounds_ = null;
  goog.base(this, "disposeInternal");
};
goog.exportSymbol("acgraph.vector.PatternFill", acgraph.vector.PatternFill);
acgraph.vector.PatternFill.prototype["addChild"] = acgraph.vector.PatternFill.prototype.addChild;
acgraph.vector.PatternFill.prototype["dispose"] = acgraph.vector.PatternFill.prototype.dispose;
goog.provide("acgraph.math.Coordinate");
goog.require("goog.math.Coordinate");
acgraph.math.Coordinate = goog.math.Coordinate;
acgraph.math.Coordinate.distance = goog.math.Coordinate.distance;
acgraph.math.Coordinate.equals = goog.math.Coordinate.equals;
acgraph.math.Coordinate.prototype.getX = function() {
  return this.x;
};
acgraph.math.Coordinate.prototype.getY = function() {
  return this.y;
};
goog.exportSymbol("acgraph.math.Coordinate", acgraph.math.Coordinate);
acgraph.math.Coordinate.prototype["getX"] = acgraph.math.Coordinate.prototype.getX;
acgraph.math.Coordinate.prototype["getY"] = acgraph.math.Coordinate.prototype.getY;
goog.provide("acgraph.utils");
goog.require("goog.userAgent");
acgraph.utils.recursiveClone = function(obj) {
  var res;
  var type = goog.typeOf(obj);
  if (type == "array") {
    res = [];
    for (var i = 0;i < obj.length;i++) {
      if (i in obj) {
        res[i] = acgraph.utils.recursiveClone(obj[i]);
      }
    }
  } else {
    if (type == "object") {
      res = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          res[key] = acgraph.utils.recursiveClone(obj[key]);
        }
      }
    } else {
      return obj;
    }
  }
  return res;
};
acgraph.utils.partialApplyingArgsToFunction = function(func, args, opt_obj) {
  if (goog.userAgent.GECKO || goog.userAgent.IE) {
    func.apply(opt_obj, args);
  } else {
    var start = 0;
    var count = 5E4;
    var end = count;
    var step = Math.ceil(args.length / count);
    for (var i = 0;i < step;i++) {
      func.apply(opt_obj, args.slice(start, end));
      start += count;
      end += count;
    }
  }
};
goog.provide("acgraph.vector.Shape");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils");
goog.require("acgraph.vector.Element");
acgraph.vector.Shape = function() {
  this.fill_ = "none";
  this.stroke_ = "black";
  goog.base(this);
};
goog.inherits(acgraph.vector.Shape, acgraph.vector.Element);
acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.FILL | acgraph.vector.Element.DirtyState.STROKE;
acgraph.vector.Shape.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (!goog.isDef(opt_fillOrColorOrKeys)) {
    return this.fill_;
  }
  var newFill = acgraph.vector.normalizeFill.apply(this, arguments);
  if (this.fill_ != newFill) {
    this.fill_ = newFill;
    this.setDirtyState(acgraph.vector.Element.DirtyState.FILL);
  }
  return this;
};
acgraph.vector.Shape.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (!goog.isDef(opt_strokeOrFill)) {
    return this.stroke_;
  }
  var newStroke = acgraph.vector.normalizeStroke.apply(this, arguments);
  if (this.stroke_ != newStroke) {
    this.stroke_ = (newStroke);
    this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE);
  }
  return this;
};
acgraph.vector.Shape.prototype.strokeThickness = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(this.stroke_)) {
      this.stroke_ = ({"color":this.stroke_, "thickness":isNaN(opt_value) ? 1 : +opt_value});
      this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE);
    } else {
      this.stroke_["thickness"] = isNaN(opt_value) ? 1 : +opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE);
    }
    return this;
  } else {
    if (goog.isString(this.stroke_)) {
      return 1;
    } else {
      return acgraph.vector.getThickness(this.stroke_);
    }
  }
};
acgraph.vector.Shape.prototype.renderInternal = function() {
  goog.base(this, "renderInternal");
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.FILL) || this.hasDirtyState(acgraph.vector.Element.DirtyState.STROKE)) {
    this.renderFillAndStroke();
  }
};
acgraph.vector.Shape.prototype.renderFillAndStroke = function() {
  acgraph.getRenderer().applyFillAndStroke(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.FILL);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.STROKE);
};
acgraph.vector.Shape.prototype.deserialize = function(data) {
  var type;
  if ("fill" in data) {
    var fillData = data["fill"];
    type = fillData["type"];
    var fill;
    if (type == "pattern") {
      var bounds = fillData["bounds"];
      fill = acgraph.patternFill(new acgraph.math.Rect(bounds.left, bounds.top, bounds.width, bounds.height));
      fill.deserialize(fillData);
    } else {
      if (type == "hatchFill") {
        fill = acgraph.hatchFill(fillData["hatchType"], fillData["color"], fillData["thickness"], fillData["size"]);
      } else {
        if (goog.isObject(fillData) && "type" in fillData) {
          delete fillData["type"];
        }
        fill = fillData;
      }
    }
    this.fill(fill);
  }
  if ("stroke" in data) {
    this.stroke(data["stroke"]);
  }
  goog.base(this, "deserialize", data);
};
acgraph.vector.Shape.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  if (this.fill_) {
    var fillData, tmpFill, tmpStroke;
    if (this.fill_ instanceof acgraph.vector.HatchFill) {
      fillData = {"type":"hatchFill", "hatchType":this.fill_.type, "color":this.fill_.color, "thickness":this.fill_.thickness, "size":this.fill_.size};
    } else {
      if (this.fill_ instanceof acgraph.vector.PatternFill) {
        fillData = this.fill_.serialize();
      } else {
        if (goog.isObject(this.fill_) && "keys" in this.fill_) {
          if ("cx" in this.fill_ && "cy" in this.fill_) {
            tmpFill = acgraph.utils.recursiveClone(this.fill_);
            tmpFill["type"] = "RadialGradientFill";
            fillData = tmpFill;
          } else {
            tmpFill = acgraph.utils.recursiveClone(this.fill_);
            tmpFill["type"] = "LinearGradientFill";
            fillData = tmpFill;
          }
        } else {
          fillData = this.fill_;
        }
      }
    }
    if (fillData) {
      data["fill"] = fillData;
    }
  }
  if (this.stroke_) {
    data["stroke"] = this.stroke_;
  } else {
    if (goog.isObject(this.stroke_) && "keys" in this.stroke_) {
      if ("cx" in this.stroke_ && "cy" in this.stroke_) {
        tmpStroke = acgraph.utils.recursiveClone(this.stroke_);
        tmpStroke["type"] = "RadialGradientFill";
        data["stroke"] = tmpStroke;
      } else {
        tmpStroke = acgraph.utils.recursiveClone(this.stroke_);
        tmpStroke["type"] = "LinearGradientFill";
        data["stroke"] = tmpStroke;
      }
    }
  }
  return data;
};
acgraph.vector.Shape.prototype.disposeInternal = function() {
  delete this.fill_;
  delete this.stroke_;
  goog.base(this, "disposeInternal");
};
acgraph.vector.Shape.prototype["stroke"] = acgraph.vector.Shape.prototype.stroke;
acgraph.vector.Shape.prototype["strokeThickness"] = acgraph.vector.Shape.prototype.strokeThickness;
acgraph.vector.Shape.prototype["fill"] = acgraph.vector.Shape.prototype.fill;
acgraph.vector.Shape.prototype["attr"] = acgraph.vector.Shape.prototype.attr;
goog.provide("acgraph.math");
goog.require("acgraph.math.Rect");
goog.require("goog.math");
acgraph.math.arcToBezier = function(cx, cy, rx, ry, fromAngle, extent, opt_addFirstPointToResult) {
  var extentRad = goog.math.toRadians(extent);
  var arcSegs = Math.ceil(Math.abs(extentRad) / Math.PI * 2);
  var inc = extentRad / arcSegs;
  var angle = goog.math.toRadians(fromAngle);
  var res = opt_addFirstPointToResult ? [cx + goog.math.angleDx(fromAngle, rx), cy + goog.math.angleDy(fromAngle, ry)] : [];
  for (var j = 0;j < arcSegs;j++) {
    var relX = Math.cos(angle);
    var relY = Math.sin(angle);
    var z = 4 / 3 * Math.sin(inc / 2) / (1 + Math.cos(inc / 2));
    var c0 = cx + (relX - z * relY) * rx;
    var c1 = cy + (relY + z * relX) * ry;
    angle += inc;
    relX = Math.cos(angle);
    relY = Math.sin(angle);
    res.push(c0, c1, cx + (relX + z * relY) * rx, cy + (relY - z * relX) * ry, cx + relX * rx, cy + relY * ry);
  }
  return res;
};
acgraph.math.calcCurveBounds = function(var_args) {
  var bounds = [[arguments[0]], [arguments[1]]];
  var f = function(p0, p1, p2, p3, t) {
    var t2 = 1 - t;
    return t2 * t2 * t2 * p0 + 3 * t2 * t2 * t * p1 + 3 * t2 * t * t * p2 + t * t * t * p3;
  };
  for (var i = 2, len = arguments.length;i < len;i += 6) {
    var p0 = [arguments[i - 2], arguments[i - 1]];
    var p1 = [arguments[i], arguments[i + 1]];
    var p2 = [arguments[i + 2], arguments[i + 3]];
    var p3 = [arguments[i + 4], arguments[i + 5]];
    bounds[0].push(p3[0]);
    bounds[1].push(p3[1]);
    var t;
    for (var j = 0;j < 2;j++) {
      var a = -3 * p0[j] + 9 * p1[j] - 9 * p2[j] + 3 * p3[j];
      var b = 6 * p0[j] - 12 * p1[j] + 6 * p2[j];
      var c = 3 * p1[j] - 3 * p0[j];
      if (a == 0) {
        if (b != 0) {
          t = -c / b;
          if (0 < t && t < 1) {
            bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));
          }
        }
      } else {
        var D = b * b - 4 * c * a;
        if (D > 0) {
          t = (-b + Math.sqrt(D)) / (2 * a);
          if (0 < t && t < 1) {
            bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));
          }
          t = (-b - Math.sqrt(D)) / (2 * a);
          if (0 < t && t < 1) {
            bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));
          }
        } else {
          if (D == 0) {
            t = -b / (2 * a);
            if (0 < t && t < 1) {
              bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));
            }
          }
        }
      }
    }
  }
  var rect = new acgraph.math.Rect(Math.min.apply(null, bounds[0]), Math.min.apply(null, bounds[1]), 0, 0);
  rect.width = Math.max.apply(null, bounds[0]) - rect.left;
  rect.height = Math.max.apply(null, bounds[1]) - rect.top;
  return rect;
};
acgraph.math.concatMatrixes = function(var_args) {
  if (arguments.length == 0) {
    return null;
  }
  var resultMatrix = null;
  var cloneResultMatrix = false;
  for (var i = 0, len = arguments.length;i < len;i++) {
    if (arguments[i]) {
      if (resultMatrix) {
        if (!cloneResultMatrix) {
          cloneResultMatrix = !!(resultMatrix = resultMatrix.clone());
        }
        resultMatrix.concatenate(arguments[i]);
      } else {
        resultMatrix = arguments[i];
      }
    }
  }
  return resultMatrix;
};
acgraph.math.getBoundsOfRectWithTransform = function(rect, tx) {
  if (!tx || tx.isIdentity()) {
    return rect;
  }
  var left = rect.left;
  var top = rect.top;
  var right = left + rect.width;
  var bottom = top + rect.height;
  var points = [left, top, left, bottom, right, top, right, bottom];
  tx.transform(points, 0, points, 0, 4);
  left = Math.min(points[0], points[2], points[4], points[6]);
  top = Math.min(points[1], points[3], points[5], points[7]);
  right = Math.max(points[0], points[2], points[4], points[6]);
  bottom = Math.max(points[1], points[3], points[5], points[7]);
  return new acgraph.math.Rect(left, top, right - left, bottom - top);
};
acgraph.math.round = function(num, opt_digitsCount) {
  var tmp = Math.pow(10, opt_digitsCount || 0);
  return Math.round(num * tmp) / tmp;
};
acgraph.math.angleBetweenVectors = function(ux, uy, vx, vy) {
  var sign = ux * vy - uy * vx;
  var cos = (ux * vx + uy * vy) / (Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy));
  cos = goog.math.clamp(cos, -1, 1);
  var result = goog.math.toDegrees(Math.acos(cos));
  return sign > 0 ? result : -result;
};
acgraph.math.getRotationAngle = function(transform) {
  if (transform) {
    return goog.math.toDegrees(Math.atan2(transform.getShearY(), transform.getScaleY()));
  } else {
    return 0;
  }
};
acgraph.math.fitWithProportion = function(targetWidth, targetHeight, sourceWidth, sourceHeight) {
  if (targetWidth < targetHeight) {
    return [targetWidth, targetWidth / sourceWidth * sourceHeight];
  } else {
    if (targetWidth > targetHeight) {
      return [targetHeight / sourceHeight * sourceWidth, targetHeight];
    } else {
      return [targetWidth, targetHeight];
    }
  }
};
goog.provide("acgraph.vector.PathBase");
goog.require("acgraph.error");
goog.require("acgraph.math");
goog.require("acgraph.math.Coordinate");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Shape");
goog.require("goog.array");
goog.require("goog.graphics.AffineTransform");
goog.require("goog.math");
acgraph.vector.PathBase = function() {
  this.segments_ = [];
  this.count_ = [];
  this.arguments_ = [];
  goog.base(this);
};
goog.inherits(acgraph.vector.PathBase, acgraph.vector.Shape);
acgraph.vector.PathBase.Segment = {MOVETO:0, LINETO:1, CURVETO:2, ARCTO:3, CLOSE:4};
acgraph.vector.PathBase.MAX_ARC_EXTENT_ = 359.999;
acgraph.vector.PathBase.segmentArgCounts_ = function() {
  var counts = [];
  counts[acgraph.vector.PathBase.Segment.MOVETO] = 2;
  counts[acgraph.vector.PathBase.Segment.LINETO] = 2;
  counts[acgraph.vector.PathBase.Segment.CURVETO] = 6;
  counts[acgraph.vector.PathBase.Segment.ARCTO] = 6;
  counts[acgraph.vector.PathBase.Segment.CLOSE] = 2;
  return counts;
}();
acgraph.vector.PathBase.getSegmentCount = function(segment) {
  return acgraph.vector.PathBase.segmentArgCounts_[segment];
};
acgraph.vector.PathBase.forEachSegment_ = function(callback, segments, count, points, opt_obj, opt_includePrevPoint) {
  var index = 0;
  opt_obj = opt_obj || null;
  for (var i = 0, length = segments.length;i < length;i++) {
    var seg = segments[i];
    var n = acgraph.vector.PathBase.getSegmentCount(seg) * count[i];
    if (opt_includePrevPoint && seg != acgraph.vector.PathBase.Segment.MOVETO) {
      callback.call(opt_obj, seg, points.slice(index - 2, index + n));
    } else {
      callback.call(opt_obj, seg, points.slice(index, index + n));
    }
    index += n;
  }
};
acgraph.vector.PathBase.calcLineBounds_ = function(var_args) {
  var rect = new acgraph.math.Rect(0, 0, 0, 0);
  if (this.transform) {
    var arr = ((arguments));
    this.transform.transform(arr, 0, arr, 0, Math.floor(arguments.length / 2));
  }
  for (var i = 0, len = arguments.length;i < len;i += 2) {
    rect.left = arguments[i];
    rect.top = arguments[i + 1];
    this.rect.boundingRect(rect);
  }
};
acgraph.vector.PathBase.calcArcBounds_ = function(startX, startY, rx, ry, angle, extent, endX, endY) {
  var rect = new acgraph.math.Rect(0, 0, 0, 0);
  var xToCheck = [startX, endX];
  var yToCheck = [startY, endY];
  var cx = startX - goog.math.angleDx(angle, rx);
  var cy = startY - goog.math.angleDy(angle, ry);
  var step = extent > 0 ? 90 : -90;
  var i = (extent > 0 ? Math.ceil(angle / 90) : Math.floor(angle / 90)) * 90;
  for (var end = angle + extent;i < end ^ extent < 0;i += step) {
    switch((Math.floor(i / 90) + 4) % 4) {
      case 0:
        xToCheck.push(cx + rx);
        break;
      case 1:
        yToCheck.push(cy + ry);
        break;
      case 2:
        xToCheck.push(cx - rx);
        break;
      case 3:
        yToCheck.push(cy - ry);
        break;
    }
  }
  rect.left = Math.min.apply(null, xToCheck);
  rect.width = Math.max.apply(null, xToCheck) - rect.left;
  rect.top = Math.min.apply(null, yToCheck);
  rect.height = Math.max.apply(null, yToCheck) - rect.top;
  this.rect.boundingRect(rect);
};
acgraph.vector.PathBase.calcCurveBounds_ = function(var_args) {
  if (this.transform) {
    var arr = ((arguments));
    this.transform.transform(arr, 0, arr, 0, Math.floor(arguments.length / 2));
  }
  this.rect.boundingRect(acgraph.math.calcCurveBounds.apply(null, arguments));
};
acgraph.vector.PathBase.calcRoughCurveBounds_ = function(var_args) {
  var rect = new acgraph.math.Rect(0, 0, 0, 0);
  if (this.transform) {
    var arr = ((arguments));
    this.transform.transform(arr, 0, arr, 0, Math.floor(arguments.length / 2));
  }
  for (var i = 0, len = arguments.length;i < len;i += 2) {
    rect.left = arguments[i];
    rect.top = arguments[i + 1];
    this.rect.boundingRect(rect);
  }
};
acgraph.vector.PathBase.prototype.forEachSegment = function(callback, opt_obj, opt_includePrevPoint) {
  acgraph.vector.PathBase.forEachSegment_(callback, this.segments_, this.count_, this.arguments_, opt_obj, opt_includePrevPoint);
};
acgraph.vector.PathBase.prototype.forEachTransformedSegment = function(callback, opt_obj, opt_includePrevPoint) {
  var args;
  if (this.transformedPathCache_) {
    args = this.transformedPathCache_;
  } else {
    var tx = this.getFullTransformation();
    if (tx) {
      args = [];
      this.simplify();
      tx.transform(this.arguments_, 0, args, 0, this.arguments_.length / 2);
    } else {
      args = this.arguments_;
    }
  }
  acgraph.vector.PathBase.forEachSegment_(callback, this.segments_, this.count_, args, opt_obj, opt_includePrevPoint);
};
acgraph.vector.PathBase.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.DATA;
acgraph.vector.PathBase.prototype.closePoint_ = null;
acgraph.vector.PathBase.prototype.currentPoint_ = null;
acgraph.vector.PathBase.prototype.simple_ = true;
acgraph.vector.PathBase.prototype.hasCurves_ = false;
acgraph.vector.PathBase.prototype.transformedPathCache_ = null;
acgraph.vector.PathBase.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.PATH;
};
acgraph.vector.PathBase.prototype.isSimple = function() {
  return this.simple_;
};
acgraph.vector.PathBase.prototype.isEmpty = function() {
  return this.segments_.length == 0;
};
acgraph.vector.PathBase.prototype.simplify = function() {
  if (this.isSimple()) {
    return this;
  }
  var points = this.arguments_;
  var segments = this.segments_;
  var count = this.count_;
  this.arguments_ = [];
  this.segments_ = [];
  this.count_ = [];
  this.clearInternal_();
  acgraph.vector.PathBase.forEachSegment_(goog.bind(function(segment, args) {
    acgraph.vector.PathBase.simplifySegmentMap_[segment].apply(this, args);
  }, this), segments, count, points);
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  return this;
};
acgraph.vector.PathBase.prototype.clearInternal = function() {
  if (!this.isEmpty()) {
    this.clearInternal_();
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }
  return this;
};
acgraph.vector.PathBase.prototype.moveToInternal = function(x, y) {
  if (goog.array.peek(this.segments_) == acgraph.vector.PathBase.Segment.MOVETO) {
    this.arguments_.length -= 2;
  } else {
    this.segments_.push(acgraph.vector.PathBase.Segment.MOVETO);
    this.count_.push(1);
  }
  this.arguments_.push(x, y);
  this.currentPoint_ = this.closePoint_ = [x, y];
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  this.transformedPathCache_ = null;
  return this;
};
acgraph.vector.PathBase.prototype.lineToInternal = function(x, y, var_args) {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  if (lastSegment != acgraph.vector.PathBase.Segment.LINETO) {
    this.segments_.push(acgraph.vector.PathBase.Segment.LINETO);
    this.count_.push(0);
  }
  for (var i = 0;i < arguments.length;i += 2) {
    x = arguments[i];
    y = arguments[i + 1];
    this.arguments_.push(x, y);
  }
  this.count_[this.count_.length - 1] += i / 2;
  this.currentPoint_ = [x, y];
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  return this;
};
acgraph.vector.PathBase.prototype.curveToInternal = function(control1X, control1Y, control2X, control2Y, endX, endY, var_args) {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  if (lastSegment != acgraph.vector.PathBase.Segment.CURVETO) {
    this.segments_.push(acgraph.vector.PathBase.Segment.CURVETO);
    this.count_.push(0);
  }
  for (var i = 0;i < arguments.length;i += 6) {
    var x = arguments[i + 4];
    var y = arguments[i + 5];
    this.arguments_.push(arguments[i], arguments[i + 1], arguments[i + 2], arguments[i + 3], x, y);
  }
  this.count_[this.count_.length - 1] += i / 6;
  this.currentPoint_ = [x, y];
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  this.hasCurves_ = true;
  return this;
};
acgraph.vector.PathBase.prototype.quadraticCurveToInternal = function(controlX, controlY, endX, endY, var_args) {
  if (this.segments_.length == 0) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  var prevX = this.currentPoint_[0];
  var prevY = this.currentPoint_[1];
  for (var i = 0;i < arguments.length;i += 4) {
    controlX = arguments[i];
    controlY = arguments[i + 1];
    var currentX = arguments[i + 2];
    var currentY = arguments[i + 3];
    this.curveToInternal(prevX + 2 * (controlX - prevX) / 3, prevY + 2 * (controlY - prevY) / 3, controlX + (currentX - controlX) / 3, controlY + (currentY - controlY) / 3, currentX, currentY);
    prevX = currentX;
    prevY = currentY;
  }
  return this;
};
acgraph.vector.PathBase.prototype.circularArcInternal = function(cx, cy, rx, ry, from, sweep, opt_lineTo) {
  var startX = cx + goog.math.angleDx(from, rx);
  var startY = cy + goog.math.angleDy(from, ry);
  if (!this.currentPoint_ || this.currentPoint_[0] != startX || this.currentPoint_[1] != startY) {
    if (opt_lineTo) {
      this.lineToInternal(startX, startY);
    } else {
      this.moveToInternal(startX, startY);
    }
  }
  return this.arcToInternal(rx, ry, from, sweep);
};
acgraph.vector.PathBase.prototype.arcToByEndPointInternal = function(x, y, rx, ry, largeArc, clockwiseArc) {
  if (rx == 0 || ry == 0) {
    return this.lineToInternal(x, y);
  }
  if (this.segments_.length == 0) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  var x0 = this.currentPoint_[0];
  var y0 = this.currentPoint_[1];
  if (x0 == x && y0 == y) {
    return this;
  }
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  var xMid = (x0 - x) / 2;
  var yMid = (y0 - y) / 2;
  var sqrXMid = xMid * xMid;
  var sqrYMid = yMid * yMid;
  var sqrRx = rx * rx;
  var sqrRy = ry * ry;
  var lambda = sqrXMid / sqrRx + sqrYMid / sqrRy;
  if (lambda > 1) {
    lambda = Math.sqrt(lambda);
    rx *= lambda;
    ry *= lambda;
    sqrRx = rx * rx;
    sqrRy = ry * ry;
  }
  var k = (sqrRx * sqrRy - sqrRx * sqrYMid - sqrRy * sqrXMid) / (sqrRx * sqrYMid + sqrRy * sqrXMid);
  if (k < 0) {
    k = 0;
  }
  k = Math.sqrt(k);
  if (largeArc == clockwiseArc) {
    k = -k;
  }
  var cxNormalized = k * rx * yMid / ry;
  var cyNormalized = -k * ry * xMid / rx;
  var startAngle = acgraph.math.angleBetweenVectors(1, 0, (xMid - cxNormalized) / rx, (yMid - cyNormalized) / ry);
  var extent = acgraph.math.angleBetweenVectors((xMid - cxNormalized) / rx, (yMid - cyNormalized) / ry, (-xMid - cxNormalized) / rx, (-yMid - cyNormalized) / ry) % 360;
  if (!clockwiseArc && extent > 0) {
    extent -= 360;
  } else {
    if (clockwiseArc && extent < 0) {
      extent += 360;
    }
  }
  return this.arcToInternal(rx, ry, startAngle, extent);
};
acgraph.vector.PathBase.prototype.arcToInternal = function(rx, ry, fromAngle, extent) {
  if (this.segments_.length == 0) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  if (extent == 0) {
    return this;
  }
  var cx = this.currentPoint_[0] - goog.math.angleDx(fromAngle, rx);
  var cy = this.currentPoint_[1] - goog.math.angleDy(fromAngle, ry);
  var ex, ey, toAngle;
  var count = goog.math.safeCeil(Math.abs(extent) / acgraph.vector.PathBase.MAX_ARC_EXTENT_);
  var inc = extent / count;
  for (var i = 0;i < count;i++) {
    toAngle = fromAngle + inc;
    ex = cx + goog.math.angleDx(toAngle, rx);
    ey = cy + goog.math.angleDy(toAngle, ry);
    this.arguments_.push(rx, ry, fromAngle, inc, ex, ey);
    this.segments_.push(acgraph.vector.PathBase.Segment.ARCTO);
    this.count_.push(1);
    fromAngle = toAngle;
  }
  this.simple_ = false;
  this.currentPoint_ = [ex, ey];
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  return this;
};
acgraph.vector.PathBase.prototype.arcToAsCurvesInternal = function(rx, ry, fromAngle, extent) {
  var cx = this.currentPoint_[0] - goog.math.angleDx(fromAngle, rx);
  var cy = this.currentPoint_[1] - goog.math.angleDy(fromAngle, ry);
  var curveParams = acgraph.math.arcToBezier(cx, cy, rx, ry, fromAngle, extent);
  this.curveToInternal.apply(this, curveParams);
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  return this;
};
acgraph.vector.PathBase.prototype.closeInternal = function() {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  if (lastSegment != acgraph.vector.PathBase.Segment.CLOSE) {
    this.arguments_.push(this.closePoint_[0], this.closePoint_[1]);
    this.segments_.push(acgraph.vector.PathBase.Segment.CLOSE);
    this.count_.push(1);
    this.currentPoint_ = this.closePoint_;
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }
  return this;
};
acgraph.vector.PathBase.prototype.getBoundsWithTransform = function(transform) {
  return this.calcBounds_(transform, acgraph.vector.PathBase.boundsCalculationMap_, true);
};
acgraph.vector.PathBase.prototype.calcBounds_ = function(transform, calcMap, allowCache) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform) {
    return this.boundsCache.clone();
  } else {
    if (this.absoluteBoundsCache && isFullTransform) {
      return this.absoluteBoundsCache.clone();
    } else {
      var rect;
      if (this.currentPoint_) {
        if (transform) {
          var arr = [this.currentPoint_[0], this.currentPoint_[1]];
          transform.transform(arr, 0, arr, 0, 1);
          rect = new acgraph.math.Rect(arr[0], arr[1], 0, 0);
          this.simplify();
        } else {
          rect = new acgraph.math.Rect(this.currentPoint_[0], this.currentPoint_[1], 0, 0);
        }
        this.forEachSegment(function(segment, args) {
          acgraph.utils.partialApplyingArgsToFunction(calcMap[segment], args, this);
        }, {rect:rect, transform:transform}, true);
      } else {
        rect = new acgraph.math.Rect(NaN, NaN, NaN, NaN);
      }
      if (isSelfTransform && allowCache) {
        this.boundsCache = rect.clone();
      }
      if (isFullTransform && allowCache) {
        this.absoluteBoundsCache = rect.clone();
      }
      return rect;
    }
  }
};
acgraph.vector.PathBase.prototype.getCurrentPointInternal = function() {
  if (this.currentPoint_) {
    return new acgraph.math.Coordinate(this.currentPoint_[0], this.currentPoint_[1]);
  }
  return null;
};
acgraph.vector.PathBase.prototype.getClosePoint = function() {
  if (this.closePoint_) {
    return new acgraph.math.Coordinate(this.closePoint_[0], this.closePoint_[1]);
  }
  return null;
};
acgraph.vector.PathBase.prototype.transformationChanged = function() {
  goog.base(this, "transformationChanged");
  this.transformedPathCache_ = null;
};
acgraph.vector.PathBase.prototype.parentTransformationChanged = function() {
  goog.base(this, "parentTransformationChanged");
  this.transformedPathCache_ = null;
};
acgraph.vector.PathBase.prototype.renderTransformation = function() {
  acgraph.getRenderer().setPathTransformation(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};
acgraph.vector.PathBase.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createPathElement();
};
acgraph.vector.PathBase.prototype.renderInternal = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    this.renderPath();
    if (this.fill() && this.fill()["src"]) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.FILL);
    }
  }
  goog.base(this, "renderInternal");
};
acgraph.vector.PathBase.prototype.renderPath = function() {
  acgraph.getRenderer().setPathProperties(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};
acgraph.vector.PathBase.simplifySegmentMap_ = function() {
  var map = [];
  map[acgraph.vector.PathBase.Segment.MOVETO] = acgraph.vector.PathBase.prototype.moveToInternal;
  map[acgraph.vector.PathBase.Segment.LINETO] = acgraph.vector.PathBase.prototype.lineToInternal;
  map[acgraph.vector.PathBase.Segment.CLOSE] = acgraph.vector.PathBase.prototype.closeInternal;
  map[acgraph.vector.PathBase.Segment.CURVETO] = acgraph.vector.PathBase.prototype.curveToInternal;
  map[acgraph.vector.PathBase.Segment.ARCTO] = acgraph.vector.PathBase.prototype.arcToAsCurvesInternal;
  return map;
}();
acgraph.vector.PathBase.boundsCalculationMap_ = function() {
  var map = [];
  map[acgraph.vector.PathBase.Segment.MOVETO] = goog.nullFunction;
  map[acgraph.vector.PathBase.Segment.LINETO] = acgraph.vector.PathBase.calcLineBounds_;
  map[acgraph.vector.PathBase.Segment.CLOSE] = goog.nullFunction;
  map[acgraph.vector.PathBase.Segment.CURVETO] = acgraph.vector.PathBase.calcCurveBounds_;
  map[acgraph.vector.PathBase.Segment.ARCTO] = acgraph.vector.PathBase.calcArcBounds_;
  return map;
}();
acgraph.vector.PathBase.boundsRoughCalculationMap_ = function() {
  var map = [];
  map[acgraph.vector.PathBase.Segment.MOVETO] = goog.nullFunction;
  map[acgraph.vector.PathBase.Segment.LINETO] = acgraph.vector.PathBase.calcLineBounds_;
  map[acgraph.vector.PathBase.Segment.CLOSE] = goog.nullFunction;
  map[acgraph.vector.PathBase.Segment.CURVETO] = acgraph.vector.PathBase.calcRoughCurveBounds_;
  map[acgraph.vector.PathBase.Segment.ARCTO] = acgraph.vector.PathBase.calcArcBounds_;
  return map;
}();
acgraph.vector.PathBase.prototype.deserialize = function(data) {
  this.closePoint_ = data["closePoint"];
  this.currentPoint_ = data["currentPoint"];
  this.segments_ = data["segments"];
  this.count_ = data["count"];
  this.arguments_ = data["arguments"];
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  goog.base(this, "deserialize", data);
};
acgraph.vector.PathBase.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  data["type"] = "path";
  data["closePoint"] = this.closePoint_ ? this.closePoint_.slice() : [];
  data["currentPoint"] = this.currentPoint_ ? this.currentPoint_.slice() : [];
  data["segments"] = this.segments_.slice();
  data["count"] = this.count_.slice();
  data["arguments"] = this.arguments_.slice();
  return data;
};
acgraph.vector.PathBase.prototype.disposeInternal = function() {
  this.closePoint_ = null;
  this.currentPoint_ = null;
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  delete this.segments_;
  delete this.count_;
  delete this.arguments_;
  goog.base(this, "disposeInternal");
};
acgraph.vector.PathBase.prototype.clearInternal_ = function() {
  this.segments_.length = 0;
  this.count_.length = 0;
  this.arguments_.length = 0;
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  delete this.closePoint_;
  delete this.currentPoint_;
  delete this.simple_;
  return this;
};
goog.provide("acgraph.vector.Path");
goog.require("acgraph.vector.PathBase");
acgraph.vector.Path = function() {
  goog.base(this);
};
goog.inherits(acgraph.vector.Path, acgraph.vector.PathBase);
acgraph.vector.Path.prototype.clear = function() {
  return (this.clearInternal());
};
acgraph.vector.Path.prototype.moveTo = function(x, y) {
  return (this.moveToInternal(x, y));
};
acgraph.vector.Path.prototype.lineTo = function(x, y, var_args) {
  return (acgraph.vector.PathBase.prototype.lineToInternal.apply(this, arguments));
};
acgraph.vector.Path.prototype.curveTo = function(control1X, control1Y, control2X, control2Y, endX, endY, var_args) {
  return (acgraph.vector.PathBase.prototype.curveToInternal.apply(this, arguments));
};
acgraph.vector.Path.prototype.quadraticCurveTo = function(controlX, controlY, endX, endY, var_args) {
  return (acgraph.vector.PathBase.prototype.quadraticCurveToInternal.apply(this, arguments));
};
acgraph.vector.Path.prototype.circularArc = function(cx, cy, rx, ry, from, sweep, opt_lineTo) {
  return (this.circularArcInternal(cx, cy, rx, ry, from, sweep, opt_lineTo));
};
acgraph.vector.Path.prototype.arcToByEndPoint = function(x, y, rx, ry, largeArc, clockwiseArc) {
  return (this.arcToByEndPointInternal(x, y, rx, ry, largeArc, clockwiseArc));
};
acgraph.vector.Path.prototype.arcTo = function(rx, ry, fromAngle, extent) {
  return (this.arcToInternal(rx, ry, fromAngle, extent));
};
acgraph.vector.Path.prototype.arcToAsCurves = function(rx, ry, fromAngle, extent) {
  return (this.arcToAsCurvesInternal(rx, ry, fromAngle, extent));
};
acgraph.vector.Path.prototype.close = function() {
  return (this.closeInternal());
};
acgraph.vector.Path.prototype.getCurrentPoint = function() {
  return this.getCurrentPointInternal();
};
goog.exportSymbol("acgraph.vector.Path", acgraph.vector.Path);
acgraph.vector.Path.prototype["moveTo"] = acgraph.vector.Path.prototype.moveTo;
acgraph.vector.Path.prototype["lineTo"] = acgraph.vector.Path.prototype.lineTo;
acgraph.vector.Path.prototype["curveTo"] = acgraph.vector.Path.prototype.curveTo;
acgraph.vector.Path.prototype["quadraticCurveTo"] = acgraph.vector.Path.prototype.quadraticCurveTo;
acgraph.vector.Path.prototype["arcTo"] = acgraph.vector.Path.prototype.arcTo;
acgraph.vector.Path.prototype["arcToByEndPoint"] = acgraph.vector.Path.prototype.arcToByEndPoint;
acgraph.vector.Path.prototype["arcToAsCurves"] = acgraph.vector.Path.prototype.arcToAsCurves;
acgraph.vector.Path.prototype["circularArc"] = acgraph.vector.Path.prototype.circularArc;
acgraph.vector.Path.prototype["close"] = acgraph.vector.Path.prototype.close;
acgraph.vector.Path.prototype["clear"] = acgraph.vector.Path.prototype.clear;
acgraph.vector.Path.prototype["getCurrentPoint"] = acgraph.vector.Path.prototype.getCurrentPoint;
goog.provide("acgraph.vector.HatchFill");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Path");
goog.require("acgraph.vector.PatternFill");
acgraph.vector.HatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  this.type = acgraph.vector.HatchFill.normalizeHatchFillType(opt_type || "");
  this.color = "" + (goog.isDefAndNotNull(opt_color) ? opt_color : "black 0.5");
  this.thickness = goog.isDefAndNotNull(opt_thickness) ? opt_thickness : 1;
  this.size = goog.isDefAndNotNull(opt_size) ? opt_size : 10;
  goog.base(this, new acgraph.math.Rect(0, 0, this.size, this.size));
  this.create_();
};
goog.inherits(acgraph.vector.HatchFill, acgraph.vector.PatternFill);
acgraph.vector.HatchFill.serialize = function(type, color, thickness, size) {
  return [type, color, thickness, size].join(",");
};
acgraph.vector.HatchFill.HatchFillType = {BACKWARD_DIAGONAL:"backwardDiagonal", FORWARD_DIAGONAL:"forwardDiagonal", HORIZONTAL:"horizontal", VERTICAL:"vertical", DASHED_BACKWARD_DIAGONAL:"dashedBackwardDiagonal", GRID:"grid", DASHED_FORWARD_DIAGONAL:"dashedForwardDiagonal", DASHED_HORIZONTAL:"dashedHorizontal", DASHED_VERTICAL:"dashedVertical", DIAGONAL_CROSS:"diagonalCross", DIAGONAL_BRICK:"diagonalBrick", DIVOT:"divot", HORIZONTAL_BRICK:"horizontalBrick", VERTICAL_BRICK:"verticalBrick", CHECKER_BOARD:"checkerBoard", 
CONFETTI:"confetti", PLAID:"plaid", SOLID_DIAMOND:"solidDiamond", ZIG_ZAG:"zigZag", WEAVE:"weave", PERCENT_05:"percent05", PERCENT_10:"percent10", PERCENT_20:"percent20", PERCENT_25:"percent25", PERCENT_30:"percent30", PERCENT_40:"percent40", PERCENT_50:"percent50", PERCENT_60:"percent60", PERCENT_70:"percent70", PERCENT_75:"percent75", PERCENT_80:"percent80", PERCENT_90:"percent90"};
acgraph.vector.HatchFill.normalizeHatchFillType = function(value, opt_default) {
  value = value.toLowerCase();
  for (var i in acgraph.vector.HatchFill.HatchFillType) {
    if (acgraph.vector.HatchFill.HatchFillType[i].toLowerCase() == value) {
      return acgraph.vector.HatchFill.HatchFillType[i];
    }
  }
  return opt_default || acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL;
};
acgraph.vector.HatchFill.prototype.create_ = function() {
  var path;
  var rect;
  var s;
  switch(this.type) {
    case acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, -1, 0, this.size + 1, 0, this.thickness);
      this.rotate(-45);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.FORWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, -1, 0, this.size + 1, 0, this.thickness);
      this.rotate(45);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.HORIZONTAL:
      path = this.path();
      this.rLine_(path, -1, this.size / 2, this.size + 1, this.size / 2, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.VERTICAL:
      path = this.path();
      this.rLine_(path, this.size / 2, -1, this.size / 2, this.size + 1, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.DIAGONAL_CROSS:
      path = this.path();
      this.rLine_(path, 0, this.size / 2, this.size, this.size / 2, this.thickness);
      this.rLine_(path, this.size / 2, 0, this.size / 2, this.size, this.thickness);
      this.rotate(45);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.GRID:
      path = this.path();
      this.rLine_(path, -1, this.size / 2, this.size + 1, this.size / 2, this.thickness);
      this.rLine_(path, this.size / 2, -1, this.size / 2, this.size + 1, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.HORIZONTAL_BRICK:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2 - 1, this.thickness);
      this.rLine_(path, 0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness);
      this.rLine_(path, 0, this.size - 1, this.size, this.size - 1, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.VERTICAL_BRICK:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2 - 1, this.thickness);
      this.rLine_(path, 0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness);
      this.rLine_(path, 0, this.size - 1, this.size, this.size - 1, this.thickness);
      this.rotate(90);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2 - 1, this.thickness);
      this.rLine_(path, 0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness);
      this.rLine_(path, 0, this.size - 1, this.size, this.size - 1, this.thickness);
      this.rotate(45);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.CHECKER_BOARD:
      this.rect(0, 0, this.size / 2, this.size / 2).fill(this.color).stroke("none");
      this.rect(this.size / 2, this.size / 2, this.size, this.size).fill(this.color).stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.CONFETTI:
      s = this.size / 8;
      var confettiSize = this.size / 4;
      this.rect(0, s * 2, confettiSize, confettiSize).fill(this.color).stroke("none");
      this.rect(s, s * 5, confettiSize, confettiSize).fill(this.color).stroke("none");
      this.rect(s * 2, 0, confettiSize, confettiSize).fill(this.color).stroke("none");
      this.rect(s * 4, s * 4, confettiSize, confettiSize).fill(this.color).stroke("none");
      this.rect(s * 5, s, confettiSize, confettiSize).fill(this.color).stroke("none");
      this.rect(s * 6, s * 6, confettiSize, confettiSize).fill(this.color).stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PLAID:
      rect = this.rect(0, 0, this.size / 2, this.size / 2);
      rect.fill(this.color);
      rect.stroke("none");
      s = this.size / 8;
      var isSelected = false;
      for (var dx = 0;dx < 2;dx++) {
        isSelected = false;
        for (var xPos = 0;xPos < 4;xPos++) {
          isSelected = !isSelected;
          for (var yPos = 0;yPos < 4;yPos++) {
            if (isSelected) {
              rect = this.rect(xPos * s + dx * this.size / 2, yPos * s + this.size / 2, s, s);
            }
            rect.fill(this.color);
            rect.stroke("none");
            isSelected = !isSelected;
          }
        }
      }
      break;
    case acgraph.vector.HatchFill.HatchFillType.SOLID_DIAMOND:
      this.path().moveTo(this.size / 2, 0).lineTo(0, this.size / 2).lineTo(this.size / 2, this.size).lineTo(this.size, this.size / 2).lineTo(this.size / 2, 0).close().fill(this.color).stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.DASHED_FORWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, 0, 0, this.size / 2, this.size / 2, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.DASHED_BACKWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, this.size / 2, 0, 0, this.size / 2, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.DASHED_HORIZONTAL:
      path = this.path();
      this.rLine_(path, 0, 0, this.size / 2, 0, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2, this.size, this.size / 2, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.DASHED_VERTICAL:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2, this.size / 2, this.size, this.thickness);
      path.fill("none");
      path.stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.DIVOT:
      var percent = .1;
      var innerPercent = .2;
      var padding = this.size * percent;
      var ds = this.size * (1 - percent * 2 - innerPercent) / 2;
      this.path().moveTo(padding + ds, padding).lineTo(padding, padding + ds / 2).lineTo(padding + ds, padding + ds).moveTo(this.size - padding - ds, this.size - padding - ds).lineTo(this.size - padding, this.size - padding - ds / 2).lineTo(this.size - padding - ds, this.size - padding).fill("none").stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.ZIG_ZAG:
      path = this.path();
      path.moveTo(0, 0).lineTo(this.size / 2, this.size / 2).lineTo(this.size, 0).moveTo(0, this.size / 2).lineTo(this.size / 2, this.size).lineTo(this.size, this.size / 2).fill("none").stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.WEAVE:
      this.path().moveTo(0, 0).lineTo(this.size / 2, this.size / 2).lineTo(this.size, 0).moveTo(0, this.size / 2).lineTo(this.size / 2, this.size).lineTo(this.size, this.size / 2).moveTo(this.size / 2, this.size / 2).lineTo(this.size * 3 / 4, this.size * 3 / 4).moveTo(this.size, this.size / 2).lineTo(this.size * 3 / 4, this.size / 4).fill("none").stroke(this.color, this.thickness);
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_05:
      this.bounds = new acgraph.math.Rect(0, 0, 8, 8);
      this.rect(0, 0, 1, 1).fill(this.color).stroke("none");
      this.rect(4, 4, 1, 1).fill(this.color).stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_10:
      this.bounds = new acgraph.math.Rect(0, 0, 8, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(4, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_20:
      this.bounds = new acgraph.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_25:
      this.bounds = new acgraph.math.Rect(0, 0, 4, 2);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_30:
      this.bounds = new acgraph.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(3, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(1, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_40:
      this.bounds = new acgraph.math.Rect(0, 0, 4, 8);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(3, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(1, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(3, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 4, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 4, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(1, 5, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(3, 5, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 6, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 6, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(1, 7, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(3, 7, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_50:
      this.bounds = new acgraph.math.Rect(0, 0, 2, 2);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(1, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_60:
      this.bounds = new acgraph.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(1, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(3, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(1, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(2, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(3, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_70:
      this.bounds = new acgraph.math.Rect(0, 0, 4, 4);
      this.path().moveTo(0, 0).lineTo(0, 1).lineTo(1, 1).lineTo(1, 0).close().moveTo(2, 0).lineTo(2, 1).lineTo(3, 1).lineTo(3, 0).close().moveTo(3, 0).lineTo(3, 1).lineTo(4, 1).lineTo(4, 0).close().moveTo(0, 1).lineTo(0, 2).lineTo(1, 2).lineTo(1, 1).close().moveTo(1, 1).lineTo(1, 2).lineTo(2, 2).lineTo(2, 1).close().moveTo(2, 1).lineTo(2, 2).lineTo(3, 2).lineTo(3, 1).close().moveTo(0, 2).lineTo(0, 3).lineTo(1, 3).lineTo(1, 2).close().moveTo(2, 2).lineTo(2, 3).lineTo(3, 3).lineTo(3, 2).close().moveTo(3, 
      2).lineTo(3, 3).lineTo(4, 3).lineTo(4, 2).close().moveTo(0, 3).lineTo(0, 4).lineTo(1, 4).lineTo(1, 3).close().moveTo(1, 3).lineTo(1, 4).lineTo(2, 4).lineTo(2, 3).close().moveTo(2, 3).lineTo(2, 4).lineTo(3, 4).lineTo(3, 3).close().fill(this.color).stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_75:
      this.bounds = new acgraph.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 4, 4);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 0, 1, 1);
      rect.fill("white");
      rect.stroke("none");
      rect = this.rect(2, 2, 1, 1);
      rect.fill("white");
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_80:
      this.bounds = new acgraph.math.Rect(0, 0, 8, 4);
      rect = this.rect(0, 0, 8, 4);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(0, 0, 1, 1);
      rect.fill("white");
      rect.stroke("none");
      rect = this.rect(4, 2, 1, 1);
      rect.fill("white");
      rect.stroke("none");
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_90:
      this.bounds = new acgraph.math.Rect(0, 0, 8, 8);
      rect = this.rect(0, 0, 8, 8);
      rect.fill(this.color);
      rect.stroke("none");
      rect = this.rect(7, 7, 1, 1);
      rect.fill("white");
      rect.stroke("none");
      rect = this.rect(4, 3, 1, 1);
      rect.fill("white");
      rect.stroke("none");
      break;
  }
};
acgraph.vector.HatchFill.prototype.rLine_ = function(path, startX, startY, endX, endY, width) {
  if (startX === endX) {
    startX = endX = Math.round(startX) + width % 2 / 2;
  }
  if (startY === endY) {
    startY = endY = Math.round(startY) + width % 2 / 2;
  }
  path.moveTo(startX, startY).lineTo(endX, endY);
  return path;
};
acgraph.vector.HatchFill.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.HATCH_FILL;
};
acgraph.vector.HatchFill.prototype.disposeInternal = function() {
  if (this.getStage()) {
    this.getStage().getDefs().removeHatchFill(this);
  }
  goog.base(this, "disposeInternal");
};
acgraph.vector.HatchFill.prototype["dispose"] = acgraph.vector.HatchFill.prototype.dispose;
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL", acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.FORWARD_DIAGONAL", acgraph.vector.HatchFill.HatchFillType.FORWARD_DIAGONAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.HORIZONTAL", acgraph.vector.HatchFill.HatchFillType.HORIZONTAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.VERTICAL", acgraph.vector.HatchFill.HatchFillType.VERTICAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.DASHED_BACKWARD_DIAGONAL", acgraph.vector.HatchFill.HatchFillType.DASHED_BACKWARD_DIAGONAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.GRID", acgraph.vector.HatchFill.HatchFillType.GRID);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.DASHED_FORWARD_DIAGONAL", acgraph.vector.HatchFill.HatchFillType.DASHED_FORWARD_DIAGONAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.DASHED_HORIZONTAL", acgraph.vector.HatchFill.HatchFillType.DASHED_HORIZONTAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.DASHED_VERTICAL", acgraph.vector.HatchFill.HatchFillType.DASHED_VERTICAL);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.DIAGONAL_CROSS", acgraph.vector.HatchFill.HatchFillType.DIAGONAL_CROSS);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK", acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.DIVOT", acgraph.vector.HatchFill.HatchFillType.DIVOT);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.HORIZONTAL_BRICK", acgraph.vector.HatchFill.HatchFillType.HORIZONTAL_BRICK);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.VERTICAL_BRICK", acgraph.vector.HatchFill.HatchFillType.VERTICAL_BRICK);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.CHECKER_BOARD", acgraph.vector.HatchFill.HatchFillType.CHECKER_BOARD);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.CONFETTI", acgraph.vector.HatchFill.HatchFillType.CONFETTI);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PLAID", acgraph.vector.HatchFill.HatchFillType.PLAID);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.SOLID_DIAMOND", acgraph.vector.HatchFill.HatchFillType.SOLID_DIAMOND);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.ZIG_ZAG", acgraph.vector.HatchFill.HatchFillType.ZIG_ZAG);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.WEAVE", acgraph.vector.HatchFill.HatchFillType.WEAVE);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_05", acgraph.vector.HatchFill.HatchFillType.PERCENT_05);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_10", acgraph.vector.HatchFill.HatchFillType.PERCENT_10);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_20", acgraph.vector.HatchFill.HatchFillType.PERCENT_20);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_25", acgraph.vector.HatchFill.HatchFillType.PERCENT_25);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_30", acgraph.vector.HatchFill.HatchFillType.PERCENT_30);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_40", acgraph.vector.HatchFill.HatchFillType.PERCENT_40);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_50", acgraph.vector.HatchFill.HatchFillType.PERCENT_50);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_60", acgraph.vector.HatchFill.HatchFillType.PERCENT_60);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_70", acgraph.vector.HatchFill.HatchFillType.PERCENT_70);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_75", acgraph.vector.HatchFill.HatchFillType.PERCENT_75);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_80", acgraph.vector.HatchFill.HatchFillType.PERCENT_80);
goog.exportSymbol("acgraph.vector.HatchFill.HatchFillType.PERCENT_90", acgraph.vector.HatchFill.HatchFillType.PERCENT_90);
goog.provide("acgraph.vector.RadialGradient");
goog.require("acgraph.utils.IdGenerator");
goog.require("goog.Disposable");
acgraph.vector.RadialGradient = function(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform) {
  goog.base(this);
  this.cx = cx;
  this.cy = cy;
  this.fx = fx;
  this.fy = fy;
  this.keys = keys;
  this.opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  this.bounds = goog.isDefAndNotNull(opt_mode) ? opt_mode : null;
  this.transform = goog.isDefAndNotNull(opt_transform) ? opt_transform : null;
};
goog.inherits(acgraph.vector.RadialGradient, goog.Disposable);
acgraph.vector.RadialGradient.serialize = function(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform) {
  var opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  var gradientKeys = [];
  goog.array.forEach(keys, function(el) {
    gradientKeys.push("" + el["offset"] + el["color"] + (el["opacity"] ? el["opacity"] : 1));
  });
  var boundsToString = opt_mode ? "" + opt_mode.left + opt_mode.top + opt_mode.width + opt_mode.height : "";
  var transformationToString = opt_transform ? opt_transform.toString() : "";
  return gradientKeys.join("") + opacity + cx + cy + fx + fy + boundsToString + transformationToString;
};
acgraph.vector.RadialGradient.prototype.rendered = false;
acgraph.vector.RadialGradient.prototype.defs = null;
acgraph.vector.RadialGradient.prototype.id_;
acgraph.vector.RadialGradient.prototype.id = function() {
  return this.id_ || (this.id_ = acgraph.utils.IdGenerator.getInstance().generateId(this));
};
acgraph.vector.RadialGradient.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.RADIAL_GRADIENT;
};
acgraph.vector.RadialGradient.prototype.dispose = function() {
  goog.base(this, "dispose");
};
acgraph.vector.RadialGradient.prototype.disposeInternal = function() {
  if (this.defs) {
    this.defs.removeRadialGradient(this);
    this.defs = null;
  }
  this.bounds = null;
  this.transform = null;
  delete this.keys;
  goog.base(this, "disposeInternal");
};
acgraph.vector.RadialGradient.prototype["dispose"] = acgraph.vector.RadialGradient.prototype.dispose;
goog.provide("acgraph.vector.LinearGradient");
goog.require("acgraph.utils.IdGenerator");
goog.require("goog.Disposable");
acgraph.vector.LinearGradient = function(keys, opt_opacity, opt_angle, opt_mode, opt_transform) {
  goog.base(this);
  this.keys = keys;
  this.opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  this.angle = goog.isDefAndNotNull(opt_angle) ? goog.math.standardAngle(opt_angle) : 0;
  this.mode = goog.isDefAndNotNull(opt_mode) ? opt_mode : false;
  this.saveAngle = !!opt_mode;
  this.bounds = opt_mode && opt_mode instanceof acgraph.math.Rect ? (opt_mode) : null;
  this.transform = goog.isDefAndNotNull(opt_transform) ? opt_transform : null;
};
goog.inherits(acgraph.vector.LinearGradient, goog.Disposable);
acgraph.vector.LinearGradient.serialize = function(keys, opt_opacity, opt_angle, opt_mode, opt_transform) {
  var angle = goog.isDefAndNotNull(opt_angle) ? goog.math.standardAngle(opt_angle) : 0;
  var opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  var saveAngle = !!opt_mode;
  var bounds = goog.isDefAndNotNull(opt_mode) ? opt_mode instanceof acgraph.math.Rect ? opt_mode : null : null;
  var gradientKeys = [];
  goog.array.forEach(keys, function(el) {
    gradientKeys.push("" + el["offset"] + el["color"] + (el["opacity"] ? el["opacity"] : null));
  });
  var boundsToString = bounds ? "" + bounds.left + bounds.top + bounds.width + bounds.height : "";
  var transformationToString = opt_transform ? opt_transform.toString() : "";
  return gradientKeys.join("") + opacity + angle + saveAngle + boundsToString + transformationToString;
};
acgraph.vector.LinearGradient.prototype.rendered = false;
acgraph.vector.LinearGradient.prototype.defs = null;
acgraph.vector.LinearGradient.prototype.id_;
acgraph.vector.LinearGradient.prototype.id = function() {
  return this.id_ || (this.id_ = acgraph.utils.IdGenerator.getInstance().generateId(this));
};
acgraph.vector.LinearGradient.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.LINEAR_GRADIENT;
};
acgraph.vector.LinearGradient.prototype.dispose = function() {
  goog.base(this, "dispose");
};
acgraph.vector.LinearGradient.prototype.disposeInternal = function() {
  if (this.defs) {
    this.defs.removeLinearGradient(this);
    this.defs = null;
  }
  this.bounds = null;
  this.transform = null;
  delete this.keys;
  this.mode = false;
  goog.base(this, "disposeInternal");
};
acgraph.vector.LinearGradient.prototype["dispose"] = acgraph.vector.LinearGradient.prototype.dispose;
goog.provide("acgraph.vector.Defs");
goog.require("acgraph.math.Rect");
goog.require("acgraph.vector.HatchFill");
goog.require("acgraph.vector.LinearGradient");
goog.require("acgraph.vector.PatternFill");
goog.require("acgraph.vector.RadialGradient");
goog.require("goog.Disposable");
acgraph.vector.Defs = function(stage) {
  goog.base(this);
  this.linearGradients_ = {};
  this.radialGradients_ = {};
  this.hatchFills_ = {};
  this.imageFills_ = {};
  this.stage = stage;
};
goog.inherits(acgraph.vector.Defs, goog.Disposable);
acgraph.vector.Defs.prototype.domElement_ = null;
acgraph.vector.Defs.prototype.domElement = function() {
  return this.domElement_;
};
acgraph.vector.Defs.prototype.createDom = function() {
  this.domElement_ = acgraph.getRenderer().createDefsElement();
};
acgraph.vector.Defs.prototype.clear = function() {
  goog.object.clear(this.linearGradients_);
  goog.object.clear(this.radialGradients_);
  goog.object.clear(this.hatchFills_);
  goog.object.clear(this.imageFills_);
  goog.dom.removeChildren(this.domElement_);
};
acgraph.vector.Defs.prototype.getLinearGradients = function() {
  return this.linearGradients_;
};
acgraph.vector.Defs.prototype.getImageFill = function(src, bounds, opt_mode, opt_opacity, opt_callback) {
  opt_opacity = goog.isDef(opt_opacity) ? opt_opacity : 1;
  var mode = goog.isDefAndNotNull(opt_mode) ? opt_mode : acgraph.vector.ImageFillMode.STRETCH;
  var id = [src, bounds.toString(), mode, opt_opacity].join(",");
  var pattern = null;
  var callback = goog.nullFunction;
  if (mode == acgraph.vector.ImageFillMode.TILE) {
    var ths = this;
    callback = function(imageWidth, imageHeight) {
      var pattern;
      if (goog.object.containsKey(ths.imageFills_, id)) {
        pattern = ths.imageFills_[id];
      } else {
        pattern = new acgraph.vector.PatternFill(new acgraph.math.Rect(bounds.left, bounds.top, imageWidth, imageHeight));
        pattern.image().src(src).opacity(opt_opacity).width(imageWidth).height(imageHeight);
        ths.imageFills_[id] = pattern;
      }
      if (opt_callback) {
        opt_callback.call(this, pattern);
      }
    };
  } else {
    if (goog.object.containsKey(this.imageFills_, id)) {
      return this.imageFills_[id];
    }
    pattern = new acgraph.vector.PatternFill(bounds);
    switch(mode) {
      case acgraph.vector.ImageFillMode.STRETCH:
        pattern.image().src(src).opacity(opt_opacity).width(bounds.width).height(bounds.height);
        break;
      case acgraph.vector.ImageFillMode.FIT_MAX:
        pattern.image().src(src).opacity(opt_opacity).width(bounds.width).height(bounds.height).align(acgraph.vector.Image.Align.X_MID_Y_MID).fittingMode(acgraph.vector.Image.Fitting.SLICE);
        break;
      case acgraph.vector.ImageFillMode.FIT:
        pattern.image().src(src).opacity(opt_opacity).width(bounds.width).height(bounds.height).align(acgraph.vector.Image.Align.X_MID_Y_MID);
        break;
    }
    this.imageFills_[id] = pattern;
  }
  acgraph.getRenderer().measuringImage(src, callback);
  callback = null;
  return this.imageFills_[id];
};
acgraph.vector.Defs.prototype.getHatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  var type = goog.isDefAndNotNull(opt_type) ? opt_type : acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL;
  var color = goog.isDefAndNotNull(opt_color) ? opt_color : "black";
  var thickness = goog.isDefAndNotNull(opt_thickness) ? opt_thickness : 1;
  var size = goog.isDefAndNotNull(opt_size) ? opt_size : 10;
  var id = acgraph.vector.HatchFill.serialize(type, color, thickness, size);
  if (goog.object.containsKey(this.hatchFills_, id)) {
    return this.hatchFills_[id];
  }
  return this.hatchFills_[id] = new acgraph.vector.HatchFill(type, color, thickness, size);
};
acgraph.vector.Defs.prototype.removeHatchFill = function(element) {
  var id = acgraph.vector.HatchFill.serialize(element.type, element.color, element.thickness, element.size);
  if (goog.object.containsKey(this.hatchFills_, id)) {
    goog.object.remove(this.hatchFills_, id);
  }
  var hatchFillDomElement = goog.dom.getElement((element.id()));
  goog.dom.removeNode(hatchFillDomElement);
};
acgraph.vector.Defs.prototype.getLinearGradient = function(keys, opt_opacity, opt_angle, opt_mode, opt_transform) {
  var id = acgraph.vector.LinearGradient.serialize(keys, opt_opacity, opt_angle, opt_mode, opt_transform);
  if (goog.object.containsKey(this.linearGradients_, id)) {
    return this.linearGradients_[id];
  }
  return this.linearGradients_[id] = new acgraph.vector.LinearGradient(keys, opt_opacity, opt_angle, opt_mode, opt_transform);
};
acgraph.vector.Defs.prototype.removeLinearGradient = function(element) {
  var id = acgraph.vector.LinearGradient.serialize(element.keys, element.opacity, element.angle, element.mode, element.transform);
  if (goog.object.containsKey(this.linearGradients_, id)) {
    goog.object.remove(this.linearGradients_, id);
  }
  var linearGradientDomElement = goog.dom.getElement(element.id());
  goog.dom.removeNode(linearGradientDomElement);
};
acgraph.vector.Defs.prototype.getRadialGradient = function(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform) {
  var id = acgraph.vector.RadialGradient.serialize(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform);
  if (goog.object.containsKey(this.radialGradients_, id)) {
    return this.radialGradients_[id];
  }
  return this.radialGradients_[id] = new acgraph.vector.RadialGradient(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform);
};
acgraph.vector.Defs.prototype.removeRadialGradient = function(element) {
  var id = acgraph.vector.RadialGradient.serialize(element.keys, element.cx, element.cy, element.fx, element.fy, element.opacity, element.bounds, element.transform);
  if (goog.object.containsKey(this.radialGradients_, id)) {
    goog.object.remove(this.radialGradients_, id);
  }
  var radialGradientDomElement = goog.dom.getElement(element.id());
  goog.dom.removeNode(radialGradientDomElement);
};
acgraph.vector.Defs.prototype.disposeInternal = function() {
  acgraph.getRenderer().removeNode(this.domElement_);
  this.domElement_ = null;
  this.linearGradients_ = null;
  delete this.stage;
};
goog.provide("acgraph.vector.svg.Defs");
goog.require("acgraph.vector.Defs");
acgraph.vector.svg.Defs = function(stage) {
  goog.base(this, stage);
  this.clips_ = {};
};
goog.inherits(acgraph.vector.svg.Defs, acgraph.vector.Defs);
acgraph.vector.svg.Defs.CLIP_FRACTION_DIGITS = 4;
acgraph.vector.svg.Defs.prototype.clear = function() {
  goog.object.clear(this.clips_);
  goog.base(this, "clear");
};
acgraph.vector.svg.Defs.prototype.getClipPathElement = function(clipShape) {
  var id = acgraph.utils.IdGenerator.getInstance().identify(clipShape);
  var res = this.clips_[id];
  if (!res) {
    this.clips_[id] = res = acgraph.getRenderer().createClipElement();
  }
  return res;
};
acgraph.vector.svg.Defs.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  for (var i in this.clips_) {
    delete this.clips_[i];
  }
  delete this.clips_;
};
goog.provide("goog.dom.classlist");
goog.require("goog.array");
goog.define("goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST", false);
goog.dom.classlist.get = function(element) {
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    return element.classList;
  }
  var className = element.className;
  return goog.isString(className) && className.match(/\S+/g) || [];
};
goog.dom.classlist.set = function(element, className) {
  element.className = className;
};
goog.dom.classlist.contains = function(element, className) {
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    return element.classList.contains(className);
  }
  return goog.array.contains(goog.dom.classlist.get(element), className);
};
goog.dom.classlist.add = function(element, className) {
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    element.classList.add(className);
    return;
  }
  if (!goog.dom.classlist.contains(element, className)) {
    element.className += element.className.length > 0 ? " " + className : className;
  }
};
goog.dom.classlist.addAll = function(element, classesToAdd) {
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    goog.array.forEach(classesToAdd, function(className) {
      goog.dom.classlist.add(element, className);
    });
    return;
  }
  var classMap = {};
  goog.array.forEach(goog.dom.classlist.get(element), function(className) {
    classMap[className] = true;
  });
  goog.array.forEach(classesToAdd, function(className) {
    classMap[className] = true;
  });
  element.className = "";
  for (var className in classMap) {
    element.className += element.className.length > 0 ? " " + className : className;
  }
};
goog.dom.classlist.remove = function(element, className) {
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    element.classList.remove(className);
    return;
  }
  if (goog.dom.classlist.contains(element, className)) {
    element.className = goog.array.filter(goog.dom.classlist.get(element), function(c) {
      return c != className;
    }).join(" ");
  }
};
goog.dom.classlist.removeAll = function(element, classesToRemove) {
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    goog.array.forEach(classesToRemove, function(className) {
      goog.dom.classlist.remove(element, className);
    });
    return;
  }
  element.className = goog.array.filter(goog.dom.classlist.get(element), function(className) {
    return !goog.array.contains(classesToRemove, className);
  }).join(" ");
};
goog.dom.classlist.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classlist.add(element, className);
  } else {
    goog.dom.classlist.remove(element, className);
  }
};
goog.dom.classlist.enableAll = function(element, classesToEnable, enabled) {
  var f = enabled ? goog.dom.classlist.addAll : goog.dom.classlist.removeAll;
  f(element, classesToEnable);
};
goog.dom.classlist.swap = function(element, fromClass, toClass) {
  if (goog.dom.classlist.contains(element, fromClass)) {
    goog.dom.classlist.remove(element, fromClass);
    goog.dom.classlist.add(element, toClass);
    return true;
  }
  return false;
};
goog.dom.classlist.toggle = function(element, className) {
  var add = !goog.dom.classlist.contains(element, className);
  goog.dom.classlist.enable(element, className, add);
  return add;
};
goog.dom.classlist.addRemove = function(element, classToRemove, classToAdd) {
  goog.dom.classlist.remove(element, classToRemove);
  goog.dom.classlist.add(element, classToAdd);
};
goog.provide("acgraph.vector.Image");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Element");
acgraph.vector.Image = function(opt_src, opt_x, opt_y, opt_width, opt_height, opt_preserveAspectRatio, opt_fittingMode) {
  this.src_ = opt_src || null;
  this.align_ = opt_preserveAspectRatio || acgraph.vector.Image.Align.NONE;
  this.fittingMode_ = opt_fittingMode || acgraph.vector.Image.Fitting.MEET;
  this.bounds_ = new acgraph.math.Rect(opt_x || 0, opt_y || 0, opt_width || 0, opt_height || 0);
  this.opacity_ = 1;
  goog.base(this);
};
goog.inherits(acgraph.vector.Image, acgraph.vector.Element);
acgraph.vector.Image.Fitting = {MEET:"meet", SLICE:"slice"};
acgraph.vector.Image.Align = {NONE:"none", X_MIN_Y_MIN:"xMinYMin", X_MID_Y_MIN:"xMidYMin", X_MAX_Y_MIN:"xMaxYMin", X_MIN_Y_MID:"xMinYMid", X_MID_Y_MID:"xMidYMid", X_MAX_Y_MID:"xMaxYMid", X_MIN_Y_MAX:"xMinYMax", X_MID_Y_MAX:"xMidYMax", X_MAX_Y_MAX:"xMaxYMax"};
acgraph.vector.Image.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.DATA;
acgraph.vector.Image.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.IMAGE;
};
acgraph.vector.Image.prototype.fittingMode = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.fittingMode_) {
      this.fittingMode_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.fittingMode_;
};
acgraph.vector.Image.prototype.align = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.align_) {
      this.align_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.align_;
};
acgraph.vector.Image.prototype.x = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.left) {
      this.bounds_.left = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.left;
};
acgraph.vector.Image.prototype.y = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.top) {
      this.bounds_.top = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.top;
};
acgraph.vector.Image.prototype.width = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.width) {
      this.bounds_.width = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.width;
};
acgraph.vector.Image.prototype.height = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.height) {
      this.bounds_.height = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.height;
};
acgraph.vector.Image.prototype.src = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.src_) {
      this.src_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.src_;
};
acgraph.vector.Image.prototype.opacity = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.opacity_) {
      this.opacity_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.opacity_;
};
acgraph.vector.Image.prototype.getBoundsWithoutTransform = function() {
  return this.bounds_.clone();
};
acgraph.vector.Image.prototype.getBoundsWithTransform = function(transform) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform) {
    return this.boundsCache.clone();
  } else {
    if (this.absoluteBoundsCache && isFullTransform) {
      return this.absoluteBoundsCache.clone();
    } else {
      var rect = acgraph.math.getBoundsOfRectWithTransform(this.bounds_.clone(), transform);
      if (isSelfTransform) {
        this.boundsCache = rect.clone();
      }
      if (isFullTransform) {
        this.absoluteBoundsCache = rect.clone();
      }
      return rect;
    }
  }
};
acgraph.vector.Image.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createImageElement();
};
acgraph.vector.Image.prototype.renderInternal = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    if (acgraph.getRenderer().needsReRenderOnParentTransformationChange()) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    }
    this.renderData();
  }
  goog.base(this, "renderInternal");
};
acgraph.vector.Image.prototype.renderTransformation = function() {
  acgraph.getRenderer().setImageTransformation(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};
acgraph.vector.Image.prototype.renderData = function() {
  acgraph.getRenderer().setImageProperties(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};
acgraph.vector.Image.prototype.deserialize = function(data) {
  var bounds = data["bounds"];
  this.x(bounds.left).y(bounds.top).width(bounds.width).height(bounds.height).src(data["src"]).align(data["align"]).fittingMode(data["fittingMode"]);
  goog.base(this, "deserialize", data);
};
acgraph.vector.Image.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  data["type"] = "image";
  data["bounds"] = this.getBoundsWithoutTransform();
  data["src"] = this.src();
  data["align"] = this.align();
  data["fittingMode"] = this.fittingMode();
  return data;
};
acgraph.vector.Image.prototype.disposeInternal = function() {
  this.bounds_ = null;
  this.dropBoundsCache();
  goog.base(this, "disposeInternal");
};
goog.exportSymbol("acgraph.vector.Image", acgraph.vector.Image);
acgraph.vector.Image.prototype["fittingMode"] = acgraph.vector.Image.prototype.fittingMode;
acgraph.vector.Image.prototype["align"] = acgraph.vector.Image.prototype.align;
acgraph.vector.Image.prototype["x"] = acgraph.vector.Image.prototype.x;
acgraph.vector.Image.prototype["y"] = acgraph.vector.Image.prototype.y;
acgraph.vector.Image.prototype["width"] = acgraph.vector.Image.prototype.width;
acgraph.vector.Image.prototype["height"] = acgraph.vector.Image.prototype.height;
acgraph.vector.Image.prototype["src"] = acgraph.vector.Image.prototype.src;
goog.exportSymbol("acgraph.vector.Image.Fitting.MEET", acgraph.vector.Image.Fitting.MEET);
goog.exportSymbol("acgraph.vector.Image.Fitting.SLICE", acgraph.vector.Image.Fitting.SLICE);
goog.exportSymbol("acgraph.vector.Image.Align.NONE", acgraph.vector.Image.Align.NONE);
goog.exportSymbol("acgraph.vector.Image.Align.X_MIN_Y_MIN", acgraph.vector.Image.Align.X_MIN_Y_MIN);
goog.exportSymbol("acgraph.vector.Image.Align.X_MID_Y_MIN", acgraph.vector.Image.Align.X_MID_Y_MIN);
goog.exportSymbol("acgraph.vector.Image.Align.X_MAX_Y_MIN", acgraph.vector.Image.Align.X_MAX_Y_MIN);
goog.exportSymbol("acgraph.vector.Image.Align.X_MIN_Y_MID", acgraph.vector.Image.Align.X_MIN_Y_MID);
goog.exportSymbol("acgraph.vector.Image.Align.X_MID_Y_MID", acgraph.vector.Image.Align.X_MID_Y_MID);
goog.exportSymbol("acgraph.vector.Image.Align.X_MAX_Y_MID", acgraph.vector.Image.Align.X_MAX_Y_MID);
goog.exportSymbol("acgraph.vector.Image.Align.X_MIN_Y_MAX", acgraph.vector.Image.Align.X_MIN_Y_MAX);
goog.exportSymbol("acgraph.vector.Image.Align.X_MID_Y_MAX", acgraph.vector.Image.Align.X_MID_Y_MAX);
goog.exportSymbol("acgraph.vector.Image.Align.X_MAX_Y_MAX", acgraph.vector.Image.Align.X_MAX_Y_MAX);
goog.provide("acgraph.vector.Rect");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.PathBase");
acgraph.vector.Rect = function(opt_x, opt_y, opt_width, opt_height) {
  this.rect_ = new acgraph.math.Rect(opt_x || 0, opt_y || 0, opt_width || 0, opt_height || 0);
  this.cornerTypes_ = [];
  this.cornerSizes_ = [0, 0, 0, 0];
  goog.base(this);
  this.drawRect_();
};
goog.inherits(acgraph.vector.Rect, acgraph.vector.PathBase);
acgraph.vector.Rect.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.DATA;
acgraph.vector.Rect.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.RECT;
};
acgraph.vector.Rect.prototype.setX = function(value) {
  if (value != this.rect_.left) {
    this.rect_.left = value;
    this.drawRect_();
  }
  return this;
};
acgraph.vector.Rect.prototype.setY = function(value) {
  if (value != this.rect_.top) {
    this.rect_.top = value;
    this.drawRect_();
  }
  return this;
};
acgraph.vector.Rect.prototype.setWidth = function(value) {
  if (this.rect_.width != value) {
    this.rect_.width = value;
    this.drawRect_();
  }
  return this;
};
acgraph.vector.Rect.prototype.setHeight = function(value) {
  if (this.rect_.height != value) {
    this.rect_.height = value;
    this.drawRect_();
  }
  return this;
};
acgraph.vector.Rect.prototype.setBounds = function(value) {
  if (!acgraph.math.Rect.equals(this.rect_, value)) {
    this.rect_.left = value.left;
    this.rect_.top = value.top;
    this.rect_.width = value.width;
    this.rect_.height = value.height;
    this.drawRect_();
  }
  return this;
};
acgraph.vector.Rect.CornerType = {ROUND:"round", CUT:"cut", ROUND_INNER:"roundInner"};
acgraph.vector.Rect.prototype.setCornerSettings_ = function(type, var_args) {
  var topLeft, topRight, bottomRight, bottomLeft, radiusArr;
  var args = goog.array.slice(arguments, 1);
  var arg1 = args[0];
  if (goog.isString(arg1)) {
    radiusArr = goog.string.splitLimit(arg1, " ", 4);
  } else {
    radiusArr = args;
  }
  if (radiusArr.length < 4) {
    bottomLeft = bottomRight = topRight = topLeft = parseFloat(radiusArr[0]);
  } else {
    topLeft = parseFloat(radiusArr[0]);
    topRight = parseFloat(radiusArr[1]);
    bottomRight = parseFloat(radiusArr[2]);
    bottomLeft = parseFloat(radiusArr[3]);
  }
  this.cornerSizes_[0] = topLeft ? topLeft : 0;
  this.cornerTypes_[0] = topLeft ? type : undefined;
  this.cornerSizes_[1] = topRight ? topRight : 0;
  this.cornerTypes_[1] = topRight ? type : undefined;
  this.cornerSizes_[2] = bottomRight ? bottomRight : 0;
  this.cornerTypes_[2] = bottomRight ? type : undefined;
  this.cornerSizes_[3] = bottomLeft ? bottomLeft : 0;
  this.cornerTypes_[3] = bottomLeft ? type : undefined;
};
acgraph.vector.Rect.prototype.drawRect_ = function() {
  var stageSuspended = !this.getStage() || this.getStage().isSuspended();
  if (!stageSuspended) {
    this.getStage().suspend();
  }
  this.clearInternal();
  var size = this.cornerSizes_[0];
  this.moveToInternal(this.rect_.left + size, this.rect_.top);
  size = this.cornerSizes_[1];
  this.lineToInternal(this.rect_.left + this.rect_.width - this.cornerSizes_[1], this.rect_.top);
  if (this.cornerTypes_[1]) {
    switch(this.cornerTypes_[1]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width, this.rect_.top + size, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width, this.rect_.top + size, size, size, false, false);
        break;
      case acgraph.vector.Rect.CornerType.CUT:
        this.lineToInternal(this.rect_.left + this.rect_.width, this.rect_.top + size);
        break;
    }
  }
  size = this.cornerSizes_[2];
  this.lineToInternal(this.rect_.left + this.rect_.width, this.rect_.top + this.rect_.height - size);
  if (this.cornerTypes_[2]) {
    switch(this.cornerTypes_[2]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width - size, this.rect_.top + this.rect_.height, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width - size, this.rect_.top + this.rect_.height, size, size, false, false);
        break;
      case acgraph.vector.Rect.CornerType.CUT:
        this.lineToInternal(this.rect_.left + this.rect_.width - size, this.rect_.top + this.rect_.height);
        break;
    }
  }
  size = this.cornerSizes_[3];
  this.lineToInternal(this.rect_.left + size, this.rect_.top + this.rect_.height);
  if (this.cornerTypes_[3]) {
    switch(this.cornerTypes_[3]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left, this.rect_.top + this.rect_.height - size, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left, this.rect_.top + this.rect_.height - size, size, size, false, false);
        break;
      case acgraph.vector.Rect.CornerType.CUT:
        this.lineToInternal(this.rect_.left, this.rect_.top + this.rect_.height - size);
        break;
    }
  }
  size = this.cornerSizes_[0];
  this.lineToInternal(this.rect_.left, this.rect_.top + size);
  if (this.cornerTypes_[0]) {
    switch(this.cornerTypes_[0]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left + size, this.rect_.top, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left + size, this.rect_.top, size, size, false, false);
        break;
    }
  }
  this.closeInternal();
  if (!stageSuspended) {
    this.getStage().resume();
  }
};
acgraph.vector.Rect.prototype.round = function(radiusAllOrLeftTop, opt_radiusRightTop, opt_radiusRightBottom, opt_radiusLeftBottom) {
  goog.array.splice(arguments, 0, 0, acgraph.vector.Rect.CornerType.ROUND);
  this.setCornerSettings_.apply(this, arguments);
  this.drawRect_();
  return this;
};
acgraph.vector.Rect.prototype.roundInner = function(radiusAllOrLeftTop, opt_radiusRightTop, opt_radiusRightBottom, opt_radiusLeftBottom) {
  goog.array.splice(arguments, 0, 0, acgraph.vector.Rect.CornerType.ROUND_INNER);
  this.setCornerSettings_.apply(this, arguments);
  this.drawRect_();
  return this;
};
acgraph.vector.Rect.prototype.cut = function(radiusAllOrLeftTop, opt_radiusRightTop, opt_radiusRightBottom, opt_radiusLeftBottom) {
  goog.array.splice(arguments, 0, 0, acgraph.vector.Rect.CornerType.CUT);
  this.setCornerSettings_.apply(this, arguments);
  this.drawRect_();
  return this;
};
acgraph.vector.Rect.prototype.deserialize = function(data) {
  goog.base(this, "deserialize", data);
  this.setX(data["x"]).setY(data["y"]).setWidth(data["width"]).setHeight(data["height"]);
  if (data["cornerTypes"]) {
    this.cornerTypes_ = (goog.string.splitLimit(data["cornerTypes"], " ", 4));
    var sizes = goog.string.splitLimit(data["cornerSizes"], " ", 4);
    goog.array.forEach(sizes, function(value, i, arr) {
      arr[i] = parseFloat(value);
    });
    this.cornerSizes_ = (sizes);
    this.drawRect_();
  }
};
acgraph.vector.Rect.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  data["type"] = "rect";
  data["x"] = this.rect_.left;
  data["y"] = this.rect_.top;
  data["width"] = this.rect_.width;
  data["height"] = this.rect_.height;
  data["cornerTypes"] = this.cornerTypes_.join(" ");
  data["cornerSizes"] = this.cornerSizes_.join(" ");
  return data;
};
acgraph.vector.Rect.prototype.disposeInternal = function() {
  this.cornerSizes_ = null;
  this.cornerTypes_ = null;
  this.rect_ = null;
  this.dropBoundsCache();
  goog.base(this, "disposeInternal");
};
goog.exportSymbol("acgraph.vector.Rect", acgraph.vector.Rect);
acgraph.vector.Rect.prototype["setX"] = acgraph.vector.Rect.prototype.setX;
acgraph.vector.Rect.prototype["setY"] = acgraph.vector.Rect.prototype.setY;
acgraph.vector.Rect.prototype["setWidth"] = acgraph.vector.Rect.prototype.setWidth;
acgraph.vector.Rect.prototype["setHeight"] = acgraph.vector.Rect.prototype.setHeight;
acgraph.vector.Rect.prototype["setBounds"] = acgraph.vector.Rect.prototype.setBounds;
acgraph.vector.Rect.prototype["cut"] = acgraph.vector.Rect.prototype.cut;
acgraph.vector.Rect.prototype["round"] = acgraph.vector.Rect.prototype.round;
acgraph.vector.Rect.prototype["roundInner"] = acgraph.vector.Rect.prototype.roundInner;
goog.provide("goog.structs");
goog.require("goog.array");
goog.require("goog.object");
goog.structs.getCount = function(col) {
  if (col.getCount && typeof col.getCount == "function") {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};
goog.structs.getValues = function(col) {
  if (col.getValues && typeof col.getValues == "function") {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split("");
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0;i < l;i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};
goog.structs.getKeys = function(col) {
  if (col.getKeys && typeof col.getKeys == "function") {
    return col.getKeys();
  }
  if (col.getValues && typeof col.getValues == "function") {
    return undefined;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0;i < l;i++) {
      rv.push(i);
    }
    return rv;
  }
  return goog.object.getKeys(col);
};
goog.structs.contains = function(col, val) {
  if (col.contains && typeof col.contains == "function") {
    return col.contains(val);
  }
  if (col.containsValue && typeof col.containsValue == "function") {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains((col), val);
  }
  return goog.object.containsValue(col, val);
};
goog.structs.isEmpty = function(col) {
  if (col.isEmpty && typeof col.isEmpty == "function") {
    return col.isEmpty();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty((col));
  }
  return goog.object.isEmpty(col);
};
goog.structs.clear = function(col) {
  if (col.clear && typeof col.clear == "function") {
    col.clear();
  } else {
    if (goog.isArrayLike(col)) {
      goog.array.clear((col));
    } else {
      goog.object.clear(col);
    }
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if (col.forEach && typeof col.forEach == "function") {
    col.forEach(f, opt_obj);
  } else {
    if (goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach((col), f, opt_obj);
    } else {
      var keys = goog.structs.getKeys(col);
      var values = goog.structs.getValues(col);
      var l = values.length;
      for (var i = 0;i < l;i++) {
        f.call((opt_obj), values[i], keys && keys[i], col);
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == "function") {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter((col), f, opt_obj);
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0;i < l;i++) {
      if (f.call((opt_obj), values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    rv = [];
    for (var i = 0;i < l;i++) {
      if (f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == "function") {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map((col), f, opt_obj);
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0;i < l;i++) {
      rv[keys[i]] = f.call((opt_obj), values[i], keys[i], col);
    }
  } else {
    rv = [];
    for (var i = 0;i < l;i++) {
      rv[i] = f.call((opt_obj), values[i], undefined, col);
    }
  }
  return rv;
};
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == "function") {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some((col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    if (f.call((opt_obj), values[i], keys && keys[i], col)) {
      return true;
    }
  }
  return false;
};
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == "function") {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every((col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    if (!f.call((opt_obj), values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};
goog.provide("goog.uri.utils");
goog.provide("goog.uri.utils.ComponentIndex");
goog.provide("goog.uri.utils.QueryArray");
goog.provide("goog.uri.utils.QueryValue");
goog.provide("goog.uri.utils.StandardQueryParam");
goog.require("goog.asserts");
goog.require("goog.string");
goog.uri.utils.CharCode_ = {AMPERSAND:38, EQUAL:61, HASH:35, QUESTION:63};
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = "";
  if (opt_scheme) {
    out += opt_scheme + ":";
  }
  if (opt_domain) {
    out += "//";
    if (opt_userInfo) {
      out += opt_userInfo + "@";
    }
    out += opt_domain;
    if (opt_port) {
      out += ":" + opt_port;
    }
  }
  if (opt_path) {
    out += opt_path;
  }
  if (opt_queryData) {
    out += "?" + opt_queryData;
  }
  if (opt_fragment) {
    out += "#" + opt_fragment;
  }
  return out;
};
goog.uri.utils.splitRe_ = new RegExp("^" + "(?:" + "([^:/?#.]+)" + ":)?" + "(?://" + "(?:([^/?#]*)@)?" + "([^/#?]*?)" + "(?::([0-9]+))?" + "(?=[/#?]|$)" + ")?" + "([^?#]+)?" + "(?:\\?([^#]*))?" + "(?:#(.*))?" + "$");
goog.uri.utils.ComponentIndex = {SCHEME:1, USER_INFO:2, DOMAIN:3, PORT:4, PATH:5, QUERY_DATA:6, FRAGMENT:7};
goog.uri.utils.split = function(uri) {
  return (uri.match(goog.uri.utils.splitRe_));
};
goog.uri.utils.decodeIfPossible_ = function(uri, opt_preserveReserved) {
  if (!uri) {
    return uri;
  }
  return opt_preserveReserved ? decodeURI(uri) : decodeURIComponent(uri);
};
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) {
  return goog.uri.utils.split(uri)[componentIndex] || null;
};
goog.uri.utils.getScheme = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.SCHEME, uri);
};
goog.uri.utils.getEffectiveScheme = function(uri) {
  var scheme = goog.uri.utils.getScheme(uri);
  if (!scheme && goog.global.self && goog.global.self.location) {
    var protocol = goog.global.self.location.protocol;
    scheme = protocol.substr(0, protocol.length - 1);
  }
  return scheme ? scheme.toLowerCase() : "";
};
goog.uri.utils.getUserInfoEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.USER_INFO, uri);
};
goog.uri.utils.getUserInfo = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getUserInfoEncoded(uri));
};
goog.uri.utils.getDomainEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.DOMAIN, uri);
};
goog.uri.utils.getDomain = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri), true);
};
goog.uri.utils.getPort = function(uri) {
  return Number(goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PORT, uri)) || null;
};
goog.uri.utils.getPathEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PATH, uri);
};
goog.uri.utils.getPath = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri), true);
};
goog.uri.utils.getQueryData = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.QUERY_DATA, uri);
};
goog.uri.utils.getFragmentEncoded = function(uri) {
  var hashIndex = uri.indexOf("#");
  return hashIndex < 0 ? null : uri.substr(hashIndex + 1);
};
goog.uri.utils.setFragmentEncoded = function(uri, fragment) {
  return goog.uri.utils.removeFragment(uri) + (fragment ? "#" + fragment : "");
};
goog.uri.utils.getFragment = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getFragmentEncoded(uri));
};
goog.uri.utils.getHost = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(pieces[goog.uri.utils.ComponentIndex.SCHEME], pieces[goog.uri.utils.ComponentIndex.USER_INFO], pieces[goog.uri.utils.ComponentIndex.DOMAIN], pieces[goog.uri.utils.ComponentIndex.PORT]);
};
goog.uri.utils.getPathAndAfter = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null, pieces[goog.uri.utils.ComponentIndex.PATH], pieces[goog.uri.utils.ComponentIndex.QUERY_DATA], pieces[goog.uri.utils.ComponentIndex.FRAGMENT]);
};
goog.uri.utils.removeFragment = function(uri) {
  var hashIndex = uri.indexOf("#");
  return hashIndex < 0 ? uri : uri.substr(0, hashIndex);
};
goog.uri.utils.haveSameDomain = function(uri1, uri2) {
  var pieces1 = goog.uri.utils.split(uri1);
  var pieces2 = goog.uri.utils.split(uri2);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] == pieces2[goog.uri.utils.ComponentIndex.DOMAIN] && pieces1[goog.uri.utils.ComponentIndex.SCHEME] == pieces2[goog.uri.utils.ComponentIndex.SCHEME] && pieces1[goog.uri.utils.ComponentIndex.PORT] == pieces2[goog.uri.utils.ComponentIndex.PORT];
};
goog.uri.utils.assertNoFragmentsOrQueries_ = function(uri) {
  if (goog.DEBUG && (uri.indexOf("#") >= 0 || uri.indexOf("?") >= 0)) {
    throw Error("goog.uri.utils: Fragment or query identifiers are not " + "supported: [" + uri + "]");
  }
};
goog.uri.utils.QueryValue;
goog.uri.utils.QueryArray;
goog.uri.utils.parseQueryData = function(encodedQuery, callback) {
  if (!encodedQuery) {
    return;
  }
  var pairs = encodedQuery.split("&");
  for (var i = 0;i < pairs.length;i++) {
    var indexOfEquals = pairs[i].indexOf("=");
    var name = null;
    var value = null;
    if (indexOfEquals >= 0) {
      name = pairs[i].substring(0, indexOfEquals);
      value = pairs[i].substring(indexOfEquals + 1);
    } else {
      name = pairs[i];
    }
    callback(name, value ? goog.string.urlDecode(value) : "");
  }
};
goog.uri.utils.appendQueryData_ = function(buffer) {
  if (buffer[1]) {
    var baseUri = (buffer[0]);
    var hashIndex = baseUri.indexOf("#");
    if (hashIndex >= 0) {
      buffer.push(baseUri.substr(hashIndex));
      buffer[0] = baseUri = baseUri.substr(0, hashIndex);
    }
    var questionIndex = baseUri.indexOf("?");
    if (questionIndex < 0) {
      buffer[1] = "?";
    } else {
      if (questionIndex == baseUri.length - 1) {
        buffer[1] = undefined;
      }
    }
  }
  return buffer.join("");
};
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) {
  if (goog.isArray(value)) {
    goog.asserts.assertArray(value);
    for (var j = 0;j < value.length;j++) {
      goog.uri.utils.appendKeyValuePairs_(key, String(value[j]), pairs);
    }
  } else {
    if (value != null) {
      pairs.push("&", key, value === "" ? "" : "=", goog.string.urlEncode(value));
    }
  }
};
goog.uri.utils.buildQueryDataBuffer_ = function(buffer, keysAndValues, opt_startIndex) {
  goog.asserts.assert(Math.max(keysAndValues.length - (opt_startIndex || 0), 0) % 2 == 0, "goog.uri.utils: Key/value lists must be even in length.");
  for (var i = opt_startIndex || 0;i < keysAndValues.length;i += 2) {
    goog.uri.utils.appendKeyValuePairs_(keysAndValues[i], keysAndValues[i + 1], buffer);
  }
  return buffer;
};
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) {
  var buffer = goog.uri.utils.buildQueryDataBuffer_([], keysAndValues, opt_startIndex);
  buffer[0] = "";
  return buffer.join("");
};
goog.uri.utils.buildQueryDataBufferFromMap_ = function(buffer, map) {
  for (var key in map) {
    goog.uri.utils.appendKeyValuePairs_(key, map[key], buffer);
  }
  return buffer;
};
goog.uri.utils.buildQueryDataFromMap = function(map) {
  var buffer = goog.uri.utils.buildQueryDataBufferFromMap_([], map);
  buffer[0] = "";
  return buffer.join("");
};
goog.uri.utils.appendParams = function(uri, var_args) {
  return goog.uri.utils.appendQueryData_(arguments.length == 2 ? goog.uri.utils.buildQueryDataBuffer_([uri], arguments[1], 0) : goog.uri.utils.buildQueryDataBuffer_([uri], arguments, 1));
};
goog.uri.utils.appendParamsFromMap = function(uri, map) {
  return goog.uri.utils.appendQueryData_(goog.uri.utils.buildQueryDataBufferFromMap_([uri], map));
};
goog.uri.utils.appendParam = function(uri, key, opt_value) {
  var paramArr = [uri, "&", key];
  if (goog.isDefAndNotNull(opt_value)) {
    paramArr.push("=", goog.string.urlEncode(opt_value));
  }
  return goog.uri.utils.appendQueryData_(paramArr);
};
goog.uri.utils.findParam_ = function(uri, startIndex, keyEncoded, hashOrEndIndex) {
  var index = startIndex;
  var keyLength = keyEncoded.length;
  while ((index = uri.indexOf(keyEncoded, index)) >= 0 && index < hashOrEndIndex) {
    var precedingChar = uri.charCodeAt(index - 1);
    if (precedingChar == goog.uri.utils.CharCode_.AMPERSAND || precedingChar == goog.uri.utils.CharCode_.QUESTION) {
      var followingChar = uri.charCodeAt(index + keyLength);
      if (!followingChar || followingChar == goog.uri.utils.CharCode_.EQUAL || followingChar == goog.uri.utils.CharCode_.AMPERSAND || followingChar == goog.uri.utils.CharCode_.HASH) {
        return index;
      }
    }
    index += keyLength + 1;
  }
  return -1;
};
goog.uri.utils.hashOrEndRe_ = /#|$/;
goog.uri.utils.hasParam = function(uri, keyEncoded) {
  return goog.uri.utils.findParam_(uri, 0, keyEncoded, uri.search(goog.uri.utils.hashOrEndRe_)) >= 0;
};
goog.uri.utils.getParamValue = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var foundIndex = goog.uri.utils.findParam_(uri, 0, keyEncoded, hashOrEndIndex);
  if (foundIndex < 0) {
    return null;
  } else {
    var endPosition = uri.indexOf("&", foundIndex);
    if (endPosition < 0 || endPosition > hashOrEndIndex) {
      endPosition = hashOrEndIndex;
    }
    foundIndex += keyEncoded.length + 1;
    return goog.string.urlDecode(uri.substr(foundIndex, endPosition - foundIndex));
  }
};
goog.uri.utils.getParamValues = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var result = [];
  while ((foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    position = uri.indexOf("&", foundIndex);
    if (position < 0 || position > hashOrEndIndex) {
      position = hashOrEndIndex;
    }
    foundIndex += keyEncoded.length + 1;
    result.push(goog.string.urlDecode(uri.substr(foundIndex, position - foundIndex)));
  }
  return result;
};
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]($|#)/;
goog.uri.utils.removeParam = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var buffer = [];
  while ((foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    buffer.push(uri.substring(position, foundIndex));
    position = Math.min(uri.indexOf("&", foundIndex) + 1 || hashOrEndIndex, hashOrEndIndex);
  }
  buffer.push(uri.substr(position));
  return buffer.join("").replace(goog.uri.utils.trailingQueryPunctuationRe_, "$1");
};
goog.uri.utils.setParam = function(uri, keyEncoded, value) {
  return goog.uri.utils.appendParam(goog.uri.utils.removeParam(uri, keyEncoded), keyEncoded, value);
};
goog.uri.utils.appendPath = function(baseUri, path) {
  goog.uri.utils.assertNoFragmentsOrQueries_(baseUri);
  if (goog.string.endsWith(baseUri, "/")) {
    baseUri = baseUri.substr(0, baseUri.length - 1);
  }
  if (goog.string.startsWith(path, "/")) {
    path = path.substr(1);
  }
  return goog.string.buildString(baseUri, "/", path);
};
goog.uri.utils.setPath = function(uri, path) {
  if (!goog.string.startsWith(path, "/")) {
    path = "/" + path;
  }
  var parts = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(parts[goog.uri.utils.ComponentIndex.SCHEME], parts[goog.uri.utils.ComponentIndex.USER_INFO], parts[goog.uri.utils.ComponentIndex.DOMAIN], parts[goog.uri.utils.ComponentIndex.PORT], path, parts[goog.uri.utils.ComponentIndex.QUERY_DATA], parts[goog.uri.utils.ComponentIndex.FRAGMENT]);
};
goog.uri.utils.StandardQueryParam = {RANDOM:"zx"};
goog.uri.utils.makeUnique = function(uri) {
  return goog.uri.utils.setParam(uri, goog.uri.utils.StandardQueryParam.RANDOM, goog.string.getRandomString());
};
goog.provide("goog.net.ErrorCode");
goog.net.ErrorCode = {NO_ERROR:0, ACCESS_DENIED:1, FILE_NOT_FOUND:2, FF_SILENT_ERROR:3, CUSTOM_ERROR:4, EXCEPTION:5, HTTP_ERROR:6, ABORT:7, TIMEOUT:8, OFFLINE:9};
goog.net.ErrorCode.getDebugMessage = function(errorCode) {
  switch(errorCode) {
    case goog.net.ErrorCode.NO_ERROR:
      return "No Error";
    case goog.net.ErrorCode.ACCESS_DENIED:
      return "Access denied to content document";
    case goog.net.ErrorCode.FILE_NOT_FOUND:
      return "File not found";
    case goog.net.ErrorCode.FF_SILENT_ERROR:
      return "Firefox silently errored";
    case goog.net.ErrorCode.CUSTOM_ERROR:
      return "Application custom error";
    case goog.net.ErrorCode.EXCEPTION:
      return "An exception occurred";
    case goog.net.ErrorCode.HTTP_ERROR:
      return "Http response at 400 or 500 level";
    case goog.net.ErrorCode.ABORT:
      return "Request was aborted";
    case goog.net.ErrorCode.TIMEOUT:
      return "Request timed out";
    case goog.net.ErrorCode.OFFLINE:
      return "The resource is not available offline";
    default:
      return "Unrecognized error code";
  }
};
goog.provide("goog.json");
goog.provide("goog.json.Replacer");
goog.provide("goog.json.Reviver");
goog.provide("goog.json.Serializer");
goog.define("goog.json.USE_NATIVE_JSON", false);
goog.json.isValid = function(s) {
  if (/^\s*$/.test(s)) {
    return false;
  }
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe = /(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;
  return remainderRe.test(s.replace(backslashesRe, "@").replace(simpleValuesRe, "]").replace(openBracketsRe, ""));
};
goog.json.parse = goog.json.USE_NATIVE_JSON ? (goog.global["JSON"]["parse"]) : function(s) {
  var o = String(s);
  if (goog.json.isValid(o)) {
    try {
      return (eval("(" + o + ")"));
    } catch (ex) {
    }
  }
  throw Error("Invalid JSON string: " + o);
};
goog.json.unsafeParse = goog.json.USE_NATIVE_JSON ? (goog.global["JSON"]["parse"]) : function(s) {
  return (eval("(" + s + ")"));
};
goog.json.Replacer;
goog.json.Reviver;
goog.json.serialize = goog.json.USE_NATIVE_JSON ? (goog.global["JSON"]["stringify"]) : function(object, opt_replacer) {
  return (new goog.json.Serializer(opt_replacer)).serialize(object);
};
goog.json.Serializer = function(opt_replacer) {
  this.replacer_ = opt_replacer;
};
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serializeInternal(object, sb);
  return sb.join("");
};
goog.json.Serializer.prototype.serializeInternal = function(object, sb) {
  if (object == null) {
    sb.push("null");
    return;
  }
  if (typeof object == "object") {
    if (goog.isArray(object)) {
      this.serializeArray(object, sb);
      return;
    } else {
      if (object instanceof String || object instanceof Number || object instanceof Boolean) {
        object = object.valueOf();
      } else {
        this.serializeObject_((object), sb);
        return;
      }
    }
  }
  switch(typeof object) {
    case "string":
      this.serializeString_(object, sb);
      break;
    case "number":
      this.serializeNumber_(object, sb);
      break;
    case "boolean":
      sb.push(String(object));
      break;
    case "function":
      sb.push("null");
      break;
    default:
      throw Error("Unknown type: " + typeof object);;
  }
};
goog.json.Serializer.charToJsonCharCache_ = {'"':'\\"', "\\":"\\\\", "/":"\\/", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\u000b"};
goog.json.Serializer.charsToReplace_ = /\uffff/.test("￿") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    var rv = goog.json.Serializer.charToJsonCharCache_[c];
    if (!rv) {
      rv = "\\u" + (c.charCodeAt(0) | 65536).toString(16).substr(1);
      goog.json.Serializer.charToJsonCharCache_[c] = rv;
    }
    return rv;
  }), '"');
};
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? String(n) : "null");
};
goog.json.Serializer.prototype.serializeArray = function(arr, sb) {
  var l = arr.length;
  sb.push("[");
  var sep = "";
  for (var i = 0;i < l;i++) {
    sb.push(sep);
    var value = arr[i];
    this.serializeInternal(this.replacer_ ? this.replacer_.call(arr, String(i), value) : value, sb);
    sep = ",";
  }
  sb.push("]");
};
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push("{");
  var sep = "";
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      if (typeof value != "function") {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(":");
        this.serializeInternal(this.replacer_ ? this.replacer_.call(obj, key, value) : value, sb);
        sep = ",";
      }
    }
  }
  sb.push("}");
};
goog.provide("goog.html.SafeScript");
goog.require("goog.asserts");
goog.require("goog.string.Const");
goog.require("goog.string.TypedString");
goog.html.SafeScript = function() {
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = "";
  this.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeScript.prototype.implementsGoogStringTypedString = true;
goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeScript.fromConstant = function(script) {
  var scriptString = goog.string.Const.unwrap(script);
  if (scriptString.length === 0) {
    return goog.html.SafeScript.EMPTY;
  }
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(scriptString);
};
goog.html.SafeScript.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeScriptWrappedValue_;
};
if (goog.DEBUG) {
  goog.html.SafeScript.prototype.toString = function() {
    return "SafeScript{" + this.privateDoNotAccessOrElseSafeScriptWrappedValue_ + "}";
  };
}
goog.html.SafeScript.unwrap = function(safeScript) {
  if (safeScript instanceof goog.html.SafeScript && safeScript.constructor === goog.html.SafeScript && safeScript.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeScript.privateDoNotAccessOrElseSafeScriptWrappedValue_;
  } else {
    goog.asserts.fail("expected object of type SafeScript, got '" + safeScript + "'");
    return "type_error:SafeScript";
  }
};
goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse = function(script) {
  return (new goog.html.SafeScript).initSecurityPrivateDoNotAccessOrElse_(script);
};
goog.html.SafeScript.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(script) {
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = script;
  return this;
};
goog.html.SafeScript.EMPTY = goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse("");
goog.provide("goog.html.uncheckedconversions");
goog.require("goog.asserts");
goog.require("goog.html.SafeHtml");
goog.require("goog.html.SafeScript");
goog.require("goog.html.SafeStyle");
goog.require("goog.html.SafeStyleSheet");
goog.require("goog.html.SafeUrl");
goog.require("goog.html.TrustedResourceUrl");
goog.require("goog.string");
goog.require("goog.string.Const");
goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract = function(justification, html, opt_dir) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(html, opt_dir || null);
};
goog.html.uncheckedconversions.safeScriptFromStringKnownToSatisfyTypeContract = function(justification, script) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.isEmpty(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(script);
};
goog.html.uncheckedconversions.safeStyleFromStringKnownToSatisfyTypeContract = function(justification, style) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};
goog.html.uncheckedconversions.safeStyleSheetFromStringKnownToSatisfyTypeContract = function(justification, styleSheet) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);
};
goog.html.uncheckedconversions.safeUrlFromStringKnownToSatisfyTypeContract = function(justification, url) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.uncheckedconversions.trustedResourceUrlFromStringKnownToSatisfyTypeContract = function(justification, url) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.provide("goog.structs.Collection");
goog.structs.Collection = function() {
};
goog.structs.Collection.prototype.add;
goog.structs.Collection.prototype.remove;
goog.structs.Collection.prototype.contains;
goog.structs.Collection.prototype.getCount;
goog.provide("goog.functions");
goog.functions.constant = function(retValue) {
  return function() {
    return retValue;
  };
};
goog.functions.FALSE = goog.functions.constant(false);
goog.functions.TRUE = goog.functions.constant(true);
goog.functions.NULL = goog.functions.constant(null);
goog.functions.identity = function(opt_returnValue, var_args) {
  return opt_returnValue;
};
goog.functions.error = function(message) {
  return function() {
    throw Error(message);
  };
};
goog.functions.fail = function(err) {
  return function() {
    throw err;
  };
};
goog.functions.lock = function(f, opt_numArgs) {
  opt_numArgs = opt_numArgs || 0;
  return function() {
    return f.apply(this, Array.prototype.slice.call(arguments, 0, opt_numArgs));
  };
};
goog.functions.nth = function(n) {
  return function() {
    return arguments[n];
  };
};
goog.functions.partialRight = function(fn, var_args) {
  var rightArgs = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.push.apply(newArgs, rightArgs);
    return fn.apply(this, newArgs);
  };
};
goog.functions.withReturnValue = function(f, retValue) {
  return goog.functions.sequence(f, goog.functions.constant(retValue));
};
goog.functions.equalTo = function(value, opt_useLooseComparison) {
  return function(other) {
    return opt_useLooseComparison ? value == other : value === other;
  };
};
goog.functions.compose = function(fn, var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    if (length) {
      result = functions[length - 1].apply(this, arguments);
    }
    for (var i = length - 2;i >= 0;i--) {
      result = functions[i].call(this, result);
    }
    return result;
  };
};
goog.functions.sequence = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    for (var i = 0;i < length;i++) {
      result = functions[i].apply(this, arguments);
    }
    return result;
  };
};
goog.functions.and = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for (var i = 0;i < length;i++) {
      if (!functions[i].apply(this, arguments)) {
        return false;
      }
    }
    return true;
  };
};
goog.functions.or = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for (var i = 0;i < length;i++) {
      if (functions[i].apply(this, arguments)) {
        return true;
      }
    }
    return false;
  };
};
goog.functions.not = function(f) {
  return function() {
    return !f.apply(this, arguments);
  };
};
goog.functions.create = function(constructor, var_args) {
  var temp = function() {
  };
  temp.prototype = constructor.prototype;
  var obj = new temp;
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj;
};
goog.define("goog.functions.CACHE_RETURN_VALUE", true);
goog.functions.cacheReturnValue = function(fn) {
  var called = false;
  var value;
  return function() {
    if (!goog.functions.CACHE_RETURN_VALUE) {
      return fn();
    }
    if (!called) {
      value = fn();
      called = true;
    }
    return value;
  };
};
goog.functions.once = function(f) {
  var inner = f;
  return function() {
    if (inner) {
      var tmp = inner;
      inner = null;
      tmp();
    }
  };
};
goog.functions.debounce = function(f, interval, opt_scope) {
  if (opt_scope) {
    f = goog.bind(f, opt_scope);
  }
  var timeout = null;
  return (function(var_args) {
    goog.global.clearTimeout(timeout);
    var args = arguments;
    timeout = goog.global.setTimeout(function() {
      f.apply(null, args);
    }, interval);
  });
};
goog.functions.throttle = function(f, interval, opt_scope) {
  if (opt_scope) {
    f = goog.bind(f, opt_scope);
  }
  var timeout = null;
  var shouldFire = false;
  var args = [];
  var handleTimeout = function() {
    timeout = null;
    if (shouldFire) {
      shouldFire = false;
      fire();
    }
  };
  var fire = function() {
    timeout = goog.global.setTimeout(handleTimeout, interval);
    f.apply(null, args);
  };
  return (function(var_args) {
    args = arguments;
    if (!timeout) {
      fire();
    } else {
      shouldFire = true;
    }
  });
};
goog.provide("goog.iter");
goog.provide("goog.iter.Iterable");
goog.provide("goog.iter.Iterator");
goog.provide("goog.iter.StopIteration");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.functions");
goog.require("goog.math");
goog.iter.Iterable;
goog.iter.StopIteration = "StopIteration" in goog.global ? goog.global["StopIteration"] : {message:"StopIteration", stack:""};
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == "function") {
    return iterable.__iterator__(false);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (true) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach((iterable), f, opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while (true) {
        f.call(opt_obj, iterable.next(), undefined, iterable);
      }
    } catch (ex$0) {
      if (ex$0 !== goog.iter.StopIteration) {
        throw ex$0;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      if (f.call(opt_obj, val, undefined, iterator)) {
        return val;
      }
    }
  };
  return newIter;
};
goog.iter.filterFalse = function(iterable, f, opt_obj) {
  return goog.iter.filter(iterable, goog.functions.not(f), opt_obj);
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop;
  }
  if (step == 0) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};
goog.iter.map = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    var val = iterator.next();
    return f.call(opt_obj, val, undefined, iterator);
  };
  return newIter;
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while (true) {
      if (f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false;
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while (true) {
      if (!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true;
};
goog.iter.chain = function(var_args) {
  return goog.iter.chainFromIterable(arguments);
};
goog.iter.chainFromIterable = function(iterable) {
  var iterator = goog.iter.toIterator(iterable);
  var iter = new goog.iter.Iterator;
  var current = null;
  iter.next = function() {
    while (true) {
      if (current == null) {
        var it = iterator.next();
        current = goog.iter.toIterator(it);
      }
      try {
        return current.next();
      } catch (ex) {
        if (ex !== goog.iter.StopIteration) {
          throw ex;
        }
        current = null;
      }
    }
  };
  return iter;
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      if (dropping && f.call(opt_obj, val, undefined, iterator)) {
        continue;
      } else {
        dropping = false;
      }
      return val;
    }
  };
  return newIter;
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    var val = iterator.next();
    if (f.call(opt_obj, val, undefined, iterator)) {
      return val;
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.toArray = function(iterable) {
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray((iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};
goog.iter.equals = function(iterable1, iterable2, opt_equalsFn) {
  var fillValue = {};
  var pairs = goog.iter.zipLongest(fillValue, iterable1, iterable2);
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  return goog.iter.every(pairs, function(pair) {
    return equalsFn(pair[0], pair[1]);
  });
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return !arr.length;
  });
  if (someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator;
  }
  var iter = new goog.iter.Iterator;
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if (indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex];
      });
      for (var i = indicies.length - 1;i >= 0;i--) {
        goog.asserts.assert(indicies);
        if (indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break;
        }
        if (i == 0) {
          indicies = null;
          break;
        }
        indicies[i] = 0;
      }
      return retVal;
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.cycle = function(iterable) {
  var baseIterator = goog.iter.toIterator(iterable);
  var cache = [];
  var cacheIndex = 0;
  var iter = new goog.iter.Iterator;
  var useCache = false;
  iter.next = function() {
    var returnElement = null;
    if (!useCache) {
      try {
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement;
      } catch (e) {
        if (e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        useCache = true;
      }
    }
    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;
    return returnElement;
  };
  return iter;
};
goog.iter.count = function(opt_start, opt_step) {
  var counter = opt_start || 0;
  var step = goog.isDef(opt_step) ? opt_step : 1;
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    var returnValue = counter;
    counter += step;
    return returnValue;
  };
  return iter;
};
goog.iter.repeat = function(value) {
  var iter = new goog.iter.Iterator;
  iter.next = goog.functions.constant(value);
  return iter;
};
goog.iter.accumulate = function(iterable) {
  var iterator = goog.iter.toIterator(iterable);
  var total = 0;
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    total += iterator.next();
    return total;
  };
  return iter;
};
goog.iter.zip = function(var_args) {
  var args = arguments;
  var iter = new goog.iter.Iterator;
  if (args.length > 0) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      var arr = goog.array.map(iterators, function(it) {
        return it.next();
      });
      return arr;
    };
  }
  return iter;
};
goog.iter.zipLongest = function(fillValue, var_args) {
  var args = goog.array.slice(arguments, 1);
  var iter = new goog.iter.Iterator;
  if (args.length > 0) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      var iteratorsHaveValues = false;
      var arr = goog.array.map(iterators, function(it) {
        var returnValue;
        try {
          returnValue = it.next();
          iteratorsHaveValues = true;
        } catch (ex) {
          if (ex !== goog.iter.StopIteration) {
            throw ex;
          }
          returnValue = fillValue;
        }
        return returnValue;
      });
      if (!iteratorsHaveValues) {
        throw goog.iter.StopIteration;
      }
      return arr;
    };
  }
  return iter;
};
goog.iter.compress = function(iterable, selectors) {
  var selectorIterator = goog.iter.toIterator(selectors);
  return goog.iter.filter(iterable, function() {
    return !!selectorIterator.next();
  });
};
goog.iter.GroupByIterator_ = function(iterable, opt_keyFunc) {
  this.iterator = goog.iter.toIterator(iterable);
  this.keyFunc = opt_keyFunc || goog.functions.identity;
  this.targetKey;
  this.currentKey;
  this.currentValue;
};
goog.inherits(goog.iter.GroupByIterator_, goog.iter.Iterator);
goog.iter.GroupByIterator_.prototype.next = function() {
  while (this.currentKey == this.targetKey) {
    this.currentValue = this.iterator.next();
    this.currentKey = this.keyFunc(this.currentValue);
  }
  this.targetKey = this.currentKey;
  return [this.currentKey, this.groupItems_(this.targetKey)];
};
goog.iter.GroupByIterator_.prototype.groupItems_ = function(targetKey) {
  var arr = [];
  while (this.currentKey == targetKey) {
    arr.push(this.currentValue);
    try {
      this.currentValue = this.iterator.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
      break;
    }
    this.currentKey = this.keyFunc(this.currentValue);
  }
  return arr;
};
goog.iter.groupBy = function(iterable, opt_keyFunc) {
  return new goog.iter.GroupByIterator_(iterable, opt_keyFunc);
};
goog.iter.starMap = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    var args = goog.iter.toArray(iterator.next());
    return f.apply(opt_obj, goog.array.concat(args, undefined, iterator));
  };
  return iter;
};
goog.iter.tee = function(iterable, opt_num) {
  var iterator = goog.iter.toIterator(iterable);
  var num = goog.isNumber(opt_num) ? opt_num : 2;
  var buffers = goog.array.map(goog.array.range(num), function() {
    return [];
  });
  var addNextIteratorValueToBuffers = function() {
    var val = iterator.next();
    goog.array.forEach(buffers, function(buffer) {
      buffer.push(val);
    });
  };
  var createIterator = function(buffer) {
    var iter = new goog.iter.Iterator;
    iter.next = function() {
      if (goog.array.isEmpty(buffer)) {
        addNextIteratorValueToBuffers();
      }
      goog.asserts.assert(!goog.array.isEmpty(buffer));
      return buffer.shift();
    };
    return iter;
  };
  return goog.array.map(buffers, createIterator);
};
goog.iter.enumerate = function(iterable, opt_start) {
  return goog.iter.zip(goog.iter.count(opt_start), iterable);
};
goog.iter.limit = function(iterable, limitSize) {
  goog.asserts.assert(goog.math.isInt(limitSize) && limitSize >= 0);
  var iterator = goog.iter.toIterator(iterable);
  var iter = new goog.iter.Iterator;
  var remaining = limitSize;
  iter.next = function() {
    if (remaining-- > 0) {
      return iterator.next();
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.consume = function(iterable, count) {
  goog.asserts.assert(goog.math.isInt(count) && count >= 0);
  var iterator = goog.iter.toIterator(iterable);
  while (count-- > 0) {
    goog.iter.nextOrValue(iterator, null);
  }
  return iterator;
};
goog.iter.slice = function(iterable, start, opt_end) {
  goog.asserts.assert(goog.math.isInt(start) && start >= 0);
  var iterator = goog.iter.consume(iterable, start);
  if (goog.isNumber(opt_end)) {
    goog.asserts.assert(goog.math.isInt(opt_end) && opt_end >= start);
    iterator = goog.iter.limit(iterator, opt_end - start);
  }
  return iterator;
};
goog.iter.hasDuplicates_ = function(arr) {
  var deduped = [];
  goog.array.removeDuplicates(arr, deduped);
  return arr.length != deduped.length;
};
goog.iter.permutations = function(iterable, opt_length) {
  var elements = goog.iter.toArray(iterable);
  var length = goog.isNumber(opt_length) ? opt_length : elements.length;
  var sets = goog.array.repeat(elements, length);
  var product = goog.iter.product.apply(undefined, sets);
  return goog.iter.filter(product, function(arr) {
    return !goog.iter.hasDuplicates_(arr);
  });
};
goog.iter.combinations = function(iterable, length) {
  var elements = goog.iter.toArray(iterable);
  var indexes = goog.iter.range(elements.length);
  var indexIterator = goog.iter.permutations(indexes, length);
  var sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr);
  });
  var iter = new goog.iter.Iterator;
  function getIndexFromElements(index) {
    return elements[index];
  }
  iter.next = function() {
    return goog.array.map(sortedIndexIterator.next(), getIndexFromElements);
  };
  return iter;
};
goog.iter.combinationsWithReplacement = function(iterable, length) {
  var elements = goog.iter.toArray(iterable);
  var indexes = goog.array.range(elements.length);
  var sets = goog.array.repeat(indexes, length);
  var indexIterator = goog.iter.product.apply(undefined, sets);
  var sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr);
  });
  var iter = new goog.iter.Iterator;
  function getIndexFromElements(index) {
    return elements[index];
  }
  iter.next = function() {
    return goog.array.map((sortedIndexIterator.next()), getIndexFromElements);
  };
  return iter;
};
goog.provide("goog.structs.Map");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.object");
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  this.count_ = 0;
  this.version_ = 0;
  var argLength = arguments.length;
  if (argLength > 1) {
    if (argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for (var i = 0;i < argLength;i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else {
    if (opt_map) {
      this.addAll((opt_map));
    }
  }
};
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return (this.keys_.concat());
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }
  if (this.count_ != otherMap.getCount()) {
    return false;
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for (var key, i = 0;key = this.keys_[i];i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }
  return true;
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }
    return true;
  }
  return false;
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
  if (this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!goog.structs.Map.hasKey_(seen, key)) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};
goog.structs.Map.prototype.set = function(key, value) {
  if (!goog.structs.Map.hasKey_(this.map_, key)) {
    this.count_++;
    this.keys_.push((key));
    this.version_++;
  }
  this.map_[key] = value;
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  for (var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i]);
  }
};
goog.structs.Map.prototype.forEach = function(f, opt_obj) {
  var keys = this.getKeys();
  for (var i = 0;i < keys.length;i++) {
    var key = keys[i];
    var value = this.get(key);
    f.call(opt_obj, value, key, this);
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map;
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }
  return transposed;
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (version != selfObj.version_) {
      throw Error("The map has changed since the iterator was created");
    }
    if (i >= selfObj.keys_.length) {
      throw goog.iter.StopIteration;
    }
    var key = selfObj.keys_[i++];
    return opt_keys ? key : selfObj.map_[key];
  };
  return newIter;
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
goog.provide("goog.structs.Set");
goog.require("goog.structs");
goog.require("goog.structs.Collection");
goog.require("goog.structs.Map");
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == "object" && val || type == "function") {
    return "o" + goog.getUid((val));
  } else {
    return type.substr(0, 1) + val;
  }
};
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    this.add(values[i]);
  }
};
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    this.remove(values[i]);
  }
};
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set;
  var values = goog.structs.getValues(col);
  for (var i = 0;i < values.length;i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }
  return result;
};
goog.structs.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result;
};
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};
goog.provide("goog.debug");
goog.require("goog.array");
goog.require("goog.html.SafeHtml");
goog.require("goog.html.SafeUrl");
goog.require("goog.html.uncheckedconversions");
goog.require("goog.string.Const");
goog.require("goog.structs.Set");
goog.require("goog.userAgent");
goog.define("goog.debug.LOGGING_ENABLED", goog.DEBUG);
goog.define("goog.debug.FORCE_SLOPPY_STACKS", false);
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  var retVal = !!opt_cancel;
  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher("535.3")) {
    retVal = !retVal;
  }
  target.onerror = function(message, url, line, opt_col, opt_error) {
    if (oldErrorHandler) {
      oldErrorHandler(message, url, line, opt_col, opt_error);
    }
    logFunc({message:message, fileName:url, line:line, col:opt_col, error:opt_error});
    return retVal;
  };
};
goog.debug.expose = function(obj, opt_showFn) {
  if (typeof obj == "undefined") {
    return "undefined";
  }
  if (obj == null) {
    return "NULL";
  }
  var str = [];
  for (var x in obj) {
    if (!opt_showFn && goog.isFunction(obj[x])) {
      continue;
    }
    var s = x + " = ";
    try {
      s += obj[x];
    } catch (e) {
      s += "*** " + e + " ***";
    }
    str.push(s);
  }
  return str.join("\n");
};
goog.debug.deepExpose = function(obj, opt_showFn) {
  var str = [];
  var helper = function(obj, space, parentSeen) {
    var nestspace = space + "  ";
    var seen = new goog.structs.Set(parentSeen);
    var indentMultiline = function(str) {
      return str.replace(/\n/g, "\n" + space);
    };
    try {
      if (!goog.isDef(obj)) {
        str.push("undefined");
      } else {
        if (goog.isNull(obj)) {
          str.push("NULL");
        } else {
          if (goog.isString(obj)) {
            str.push('"' + indentMultiline(obj) + '"');
          } else {
            if (goog.isFunction(obj)) {
              str.push(indentMultiline(String(obj)));
            } else {
              if (goog.isObject(obj)) {
                if (seen.contains(obj)) {
                  str.push("*** reference loop detected ***");
                } else {
                  seen.add(obj);
                  str.push("{");
                  for (var x in obj) {
                    if (!opt_showFn && goog.isFunction(obj[x])) {
                      continue;
                    }
                    str.push("\n");
                    str.push(nestspace);
                    str.push(x + " = ");
                    helper(obj[x], nestspace, seen);
                  }
                  str.push("\n" + space + "}");
                }
              } else {
                str.push(obj);
              }
            }
          }
        }
      }
    } catch (e) {
      str.push("*** " + e + " ***");
    }
  };
  helper(obj, "", new goog.structs.Set);
  return str.join("");
};
goog.debug.exposeArray = function(arr) {
  var str = [];
  for (var i = 0;i < arr.length;i++) {
    if (goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]));
    } else {
      str.push(arr[i]);
    }
  }
  return "[ " + str.join(", ") + " ]";
};
goog.debug.exposeException = function(err, opt_fn) {
  var html = goog.debug.exposeExceptionAsHtml(err, opt_fn);
  return goog.html.SafeHtml.unwrap(html);
};
goog.debug.exposeExceptionAsHtml = function(err, opt_fn) {
  try {
    var e = goog.debug.normalizeErrorObject(err);
    var viewSourceUrl = goog.debug.createViewSourceUrl_(e.fileName);
    var error = goog.html.SafeHtml.concat(goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces("Message: " + e.message + "\nUrl: "), goog.html.SafeHtml.create("a", {href:viewSourceUrl, target:"_new"}, e.fileName), goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces("\nLine: " + e.lineNumber + "\n\nBrowser stack:\n" + e.stack + "-> " + "[end]\n\nJS stack traversal:\n" + goog.debug.getStacktrace(opt_fn) + "-> "));
    return error;
  } catch (e2) {
    return goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces("Exception trying to expose exception! You win, we lose. " + e2);
  }
};
goog.debug.createViewSourceUrl_ = function(opt_fileName) {
  if (!goog.isDefAndNotNull(opt_fileName)) {
    opt_fileName = "";
  }
  if (!/^https?:\/\//i.test(opt_fileName)) {
    return goog.html.SafeUrl.fromConstant(goog.string.Const.from("sanitizedviewsrc"));
  }
  var sanitizedFileName = goog.html.SafeUrl.sanitize(opt_fileName);
  return goog.html.uncheckedconversions.safeUrlFromStringKnownToSatisfyTypeContract(goog.string.Const.from("view-source scheme plus HTTP/HTTPS URL"), "view-source:" + goog.html.SafeUrl.unwrap(sanitizedFileName));
};
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName("window.location.href");
  if (goog.isString(err)) {
    return {"message":err, "name":"Unknown error", "lineNumber":"Not available", "fileName":href, "stack":"Not available"};
  }
  var lineNumber, fileName;
  var threwError = false;
  try {
    lineNumber = err.lineNumber || err.line || "Not available";
  } catch (e) {
    lineNumber = "Not available";
    threwError = true;
  }
  try {
    fileName = err.fileName || err.filename || err.sourceURL || goog.global["$googDebugFname"] || href;
  } catch (e$1) {
    fileName = "Not available";
    threwError = true;
  }
  if (threwError || !err.lineNumber || !err.fileName || !err.stack || !err.message || !err.name) {
    return {"message":err.message || "Not available", "name":err.name || "UnknownError", "lineNumber":lineNumber, "fileName":fileName, "stack":err.stack || "Not available"};
  }
  return err;
};
goog.debug.enhanceError = function(err, opt_message) {
  var error;
  if (typeof err == "string") {
    error = Error(err);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, goog.debug.enhanceError);
    }
  } else {
    error = err;
  }
  if (!error.stack) {
    error.stack = goog.debug.getStacktrace(goog.debug.enhanceError);
  }
  if (opt_message) {
    var x = 0;
    while (error["message" + x]) {
      ++x;
    }
    error["message" + x] = String(opt_message);
  }
  return error;
};
goog.debug.getStacktraceSimple = function(opt_depth) {
  if (!goog.debug.FORCE_SLOPPY_STACKS) {
    var stack = goog.debug.getNativeStackTrace_(goog.debug.getStacktraceSimple);
    if (stack) {
      return stack;
    }
  }
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;
  while (fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push("()\n");
    try {
      fn = fn.caller;
    } catch (e) {
      sb.push("[exception trying to get caller]\n");
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push("[...long stack...]");
      break;
    }
  }
  if (opt_depth && depth >= opt_depth) {
    sb.push("[...reached max depth limit...]");
  } else {
    sb.push("[end]");
  }
  return sb.join("");
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getNativeStackTrace_ = function(fn) {
  var tempErr = new Error;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(tempErr, fn);
    return String(tempErr.stack);
  } else {
    try {
      throw tempErr;
    } catch (e) {
      tempErr = e;
    }
    var stack = tempErr.stack;
    if (stack) {
      return String(stack);
    }
  }
  return null;
};
goog.debug.getStacktrace = function(opt_fn) {
  var stack;
  if (!goog.debug.FORCE_SLOPPY_STACKS) {
    var contextFn = opt_fn || goog.debug.getStacktrace;
    stack = goog.debug.getNativeStackTrace_(contextFn);
  }
  if (!stack) {
    stack = goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, []);
  }
  return stack;
};
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];
  if (goog.array.contains(visited, fn)) {
    sb.push("[...circular reference...]");
  } else {
    if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
      sb.push(goog.debug.getFunctionName(fn) + "(");
      var args = fn.arguments;
      for (var i = 0;args && i < args.length;i++) {
        if (i > 0) {
          sb.push(", ");
        }
        var argDesc;
        var arg = args[i];
        switch(typeof arg) {
          case "object":
            argDesc = arg ? "object" : "null";
            break;
          case "string":
            argDesc = arg;
            break;
          case "number":
            argDesc = String(arg);
            break;
          case "boolean":
            argDesc = arg ? "true" : "false";
            break;
          case "function":
            argDesc = goog.debug.getFunctionName(arg);
            argDesc = argDesc ? argDesc : "[fn]";
            break;
          case "undefined":
          ;
          default:
            argDesc = typeof arg;
            break;
        }
        if (argDesc.length > 40) {
          argDesc = argDesc.substr(0, 40) + "...";
        }
        sb.push(argDesc);
      }
      visited.push(fn);
      sb.push(")\n");
      try {
        sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
      } catch (e) {
        sb.push("[exception trying to get caller]\n");
      }
    } else {
      if (fn) {
        sb.push("[...long stack...]");
      } else {
        sb.push("[end]");
      }
    }
  }
  return sb.join("");
};
goog.debug.setFunctionResolver = function(resolver) {
  goog.debug.fnNameResolver_ = resolver;
};
goog.debug.getFunctionName = function(fn) {
  if (goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn];
  }
  if (goog.debug.fnNameResolver_) {
    var name = goog.debug.fnNameResolver_(fn);
    if (name) {
      goog.debug.fnNameCache_[fn] = name;
      return name;
    }
  }
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if (matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method;
    } else {
      goog.debug.fnNameCache_[functionSource] = "[Anonymous]";
    }
  }
  return goog.debug.fnNameCache_[functionSource];
};
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]");
};
goog.debug.runtimeType = function(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || "unknown type name";
  } else {
    if (value instanceof Object) {
      return value.constructor.displayName || value.constructor.name || Object.prototype.toString.call(value);
    } else {
      return value === null ? "null" : typeof value;
    }
  }
};
goog.debug.fnNameCache_ = {};
goog.debug.fnNameResolver_;
goog.provide("goog.debug.LogRecord");
goog.debug.LogRecord = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber);
};
goog.debug.LogRecord.prototype.time_;
goog.debug.LogRecord.prototype.level_;
goog.debug.LogRecord.prototype.msg_;
goog.debug.LogRecord.prototype.loggerName_;
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;
goog.debug.LogRecord.prototype.exception_ = null;
goog.define("goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS", true);
goog.debug.LogRecord.nextSequenceNumber_ = 0;
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  if (goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == "number" ? opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++;
  }
  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
};
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_;
};
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_;
};
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception;
};
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName;
};
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_;
};
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level;
};
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_;
};
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg;
};
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_;
};
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time;
};
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_;
};
goog.provide("goog.debug.LogBuffer");
goog.require("goog.asserts");
goog.require("goog.debug.LogRecord");
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(), "Cannot use goog.debug.LogBuffer without defining " + "goog.debug.LogBuffer.CAPACITY.");
  this.clear();
};
goog.debug.LogBuffer.getInstance = function() {
  if (!goog.debug.LogBuffer.instance_) {
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer;
  }
  return goog.debug.LogBuffer.instance_;
};
goog.define("goog.debug.LogBuffer.CAPACITY", 0);
goog.debug.LogBuffer.prototype.buffer_;
goog.debug.LogBuffer.prototype.curIndex_;
goog.debug.LogBuffer.prototype.isFull_;
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if (this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret;
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] = new goog.debug.LogRecord(level, msg, loggerName);
};
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0;
};
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false;
};
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  if (!buffer[0]) {
    return;
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func((buffer[i]));
  } while (i != curIndex);
};
goog.provide("goog.debug.LogManager");
goog.provide("goog.debug.Loggable");
goog.provide("goog.debug.Logger");
goog.provide("goog.debug.Logger.Level");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug");
goog.require("goog.debug.LogBuffer");
goog.require("goog.debug.LogRecord");
goog.debug.Loggable;
goog.debug.Logger = function(name) {
  this.name_ = name;
  this.parent_ = null;
  this.level_ = null;
  this.children_ = null;
  this.handlers_ = null;
};
goog.debug.Logger.ROOT_LOGGER_NAME = "";
goog.define("goog.debug.Logger.ENABLE_HIERARCHY", true);
if (!goog.debug.Logger.ENABLE_HIERARCHY) {
  goog.debug.Logger.rootHandlers_ = [];
  goog.debug.Logger.rootLevel_;
}
goog.debug.Logger.Level = function(name, value) {
  this.name = name;
  this.value = value;
};
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name;
};
goog.debug.Logger.Level.OFF = new goog.debug.Logger.Level("OFF", Infinity);
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level("SHOUT", 1200);
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level("SEVERE", 1E3);
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level("WARNING", 900);
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level("INFO", 800);
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level("CONFIG", 700);
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level("FINE", 500);
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level("FINER", 400);
goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level("FINEST", 300);
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level("ALL", 0);
goog.debug.Logger.Level.PREDEFINED_LEVELS = [goog.debug.Logger.Level.OFF, goog.debug.Logger.Level.SHOUT, goog.debug.Logger.Level.SEVERE, goog.debug.Logger.Level.WARNING, goog.debug.Logger.Level.INFO, goog.debug.Logger.Level.CONFIG, goog.debug.Logger.Level.FINE, goog.debug.Logger.Level.FINER, goog.debug.Logger.Level.FINEST, goog.debug.Logger.Level.ALL];
goog.debug.Logger.Level.predefinedLevelsCache_ = null;
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for (var i = 0, level;level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level;
  }
};
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }
  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null;
};
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }
  if (value in (goog.debug.Logger.Level.predefinedLevelsCache_)) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value];
  }
  for (var i = 0;i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length;++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if (level.value <= value) {
      return level;
    }
  }
  return null;
};
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name);
};
goog.debug.Logger.logToProfilers = function(msg) {
  if (goog.global["console"]) {
    if (goog.global["console"]["timeStamp"]) {
      goog.global["console"]["timeStamp"](msg);
    } else {
      if (goog.global["console"]["markTimeline"]) {
        goog.global["console"]["markTimeline"](msg);
      }
    }
  }
  if (goog.global["msWriteProfilerMark"]) {
    goog.global["msWriteProfilerMark"](msg);
  }
};
goog.debug.Logger.prototype.getName = function() {
  return this.name_;
};
goog.debug.Logger.prototype.addHandler = function(handler) {
  if (goog.debug.LOGGING_ENABLED) {
    if (goog.debug.Logger.ENABLE_HIERARCHY) {
      if (!this.handlers_) {
        this.handlers_ = [];
      }
      this.handlers_.push(handler);
    } else {
      goog.asserts.assert(!this.name_, "Cannot call addHandler on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootHandlers_.push(handler);
    }
  }
};
goog.debug.Logger.prototype.removeHandler = function(handler) {
  if (goog.debug.LOGGING_ENABLED) {
    var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ : goog.debug.Logger.rootHandlers_;
    return !!handlers && goog.array.remove(handlers, handler);
  } else {
    return false;
  }
};
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_;
};
goog.debug.Logger.prototype.getChildren = function() {
  if (!this.children_) {
    this.children_ = {};
  }
  return this.children_;
};
goog.debug.Logger.prototype.setLevel = function(level) {
  if (goog.debug.LOGGING_ENABLED) {
    if (goog.debug.Logger.ENABLE_HIERARCHY) {
      this.level_ = level;
    } else {
      goog.asserts.assert(!this.name_, "Cannot call setLevel() on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootLevel_ = level;
    }
  }
};
goog.debug.Logger.prototype.getLevel = function() {
  return goog.debug.LOGGING_ENABLED ? this.level_ : goog.debug.Logger.Level.OFF;
};
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if (!goog.debug.LOGGING_ENABLED) {
    return goog.debug.Logger.Level.OFF;
  }
  if (!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_;
  }
  if (this.level_) {
    return this.level_;
  }
  if (this.parent_) {
    return this.parent_.getEffectiveLevel();
  }
  goog.asserts.fail("Root logger has no level set.");
  return null;
};
goog.debug.Logger.prototype.isLoggable = function(level) {
  return goog.debug.LOGGING_ENABLED && level.value >= this.getEffectiveLevel().value;
};
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED && this.isLoggable(level)) {
    if (goog.isFunction(msg)) {
      msg = msg();
    }
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception));
  }
};
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if (goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord = goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_)
  } else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_);
  }
  if (opt_exception) {
    logRecord.setException(opt_exception);
  }
  return logRecord;
};
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.INFO, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINE, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINER, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if (goog.debug.LOGGING_ENABLED && this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord);
  }
};
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  goog.debug.Logger.logToProfilers("log:" + logRecord.getMessage());
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while (target) {
      target.callPublish_(logRecord);
      target = target.getParent();
    }
  } else {
    for (var i = 0, handler;handler = goog.debug.Logger.rootHandlers_[i++];) {
      handler(logRecord);
    }
  }
};
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if (this.handlers_) {
    for (var i = 0, handler;handler = this.handlers_[i];i++) {
      handler(logRecord);
    }
  }
};
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent;
};
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger;
};
goog.debug.LogManager = {};
goog.debug.LogManager.loggers_ = {};
goog.debug.LogManager.rootLogger_ = null;
goog.debug.LogManager.initialize = function() {
  if (!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger(goog.debug.Logger.ROOT_LOGGER_NAME);
    goog.debug.LogManager.loggers_[goog.debug.Logger.ROOT_LOGGER_NAME] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG);
  }
};
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_;
};
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return (goog.debug.LogManager.rootLogger_);
};
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name);
};
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe("Error: " + info.message + " (" + info.fileName + " @ Line: " + info.line + ")");
  };
};
goog.debug.LogManager.createLogger_ = function(name) {
  var logger = new goog.debug.Logger(name);
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf(".");
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger);
  }
  goog.debug.LogManager.loggers_[name] = logger;
  return logger;
};
goog.provide("goog.log");
goog.provide("goog.log.Level");
goog.provide("goog.log.LogRecord");
goog.provide("goog.log.Logger");
goog.require("goog.debug");
goog.require("goog.debug.LogManager");
goog.require("goog.debug.LogRecord");
goog.require("goog.debug.Logger");
goog.define("goog.log.ENABLED", goog.debug.LOGGING_ENABLED);
goog.log.ROOT_LOGGER_NAME = goog.debug.Logger.ROOT_LOGGER_NAME;
goog.log.Logger = goog.debug.Logger;
goog.log.Level = goog.debug.Logger.Level;
goog.log.LogRecord = goog.debug.LogRecord;
goog.log.getLogger = function(name, opt_level) {
  if (goog.log.ENABLED) {
    var logger = goog.debug.LogManager.getLogger(name);
    if (opt_level && logger) {
      logger.setLevel(opt_level);
    }
    return logger;
  } else {
    return null;
  }
};
goog.log.addHandler = function(logger, handler) {
  if (goog.log.ENABLED && logger) {
    logger.addHandler(handler);
  }
};
goog.log.removeHandler = function(logger, handler) {
  if (goog.log.ENABLED && logger) {
    return logger.removeHandler(handler);
  } else {
    return false;
  }
};
goog.log.log = function(logger, level, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.log(level, msg, opt_exception);
  }
};
goog.log.error = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.severe(msg, opt_exception);
  }
};
goog.log.warning = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.warning(msg, opt_exception);
  }
};
goog.log.info = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.info(msg, opt_exception);
  }
};
goog.log.fine = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.fine(msg, opt_exception);
  }
};
goog.provide("goog.net.XhrLike");
goog.net.XhrLike = function() {
};
goog.net.XhrLike.OrNative;
goog.net.XhrLike.prototype.onreadystatechange;
goog.net.XhrLike.prototype.responseText;
goog.net.XhrLike.prototype.responseXML;
goog.net.XhrLike.prototype.readyState;
goog.net.XhrLike.prototype.status;
goog.net.XhrLike.prototype.statusText;
goog.net.XhrLike.prototype.open = function(method, url, opt_async, opt_user, opt_password) {
};
goog.net.XhrLike.prototype.send = function(opt_data) {
};
goog.net.XhrLike.prototype.abort = function() {
};
goog.net.XhrLike.prototype.setRequestHeader = function(header, value) {
};
goog.net.XhrLike.prototype.getResponseHeader = function(header) {
};
goog.net.XhrLike.prototype.getAllResponseHeaders = function() {
};
goog.provide("goog.net.XmlHttpFactory");
goog.require("goog.net.XhrLike");
goog.net.XmlHttpFactory = function() {
};
goog.net.XmlHttpFactory.prototype.cachedOptions_ = null;
goog.net.XmlHttpFactory.prototype.createInstance = goog.abstractMethod;
goog.net.XmlHttpFactory.prototype.getOptions = function() {
  return this.cachedOptions_ || (this.cachedOptions_ = this.internalGetOptions());
};
goog.net.XmlHttpFactory.prototype.internalGetOptions = goog.abstractMethod;
goog.provide("goog.net.WrapperXmlHttpFactory");
goog.require("goog.net.XhrLike");
goog.require("goog.net.XmlHttpFactory");
goog.net.WrapperXmlHttpFactory = function(xhrFactory, optionsFactory) {
  goog.net.XmlHttpFactory.call(this);
  this.xhrFactory_ = xhrFactory;
  this.optionsFactory_ = optionsFactory;
};
goog.inherits(goog.net.WrapperXmlHttpFactory, goog.net.XmlHttpFactory);
goog.net.WrapperXmlHttpFactory.prototype.createInstance = function() {
  return this.xhrFactory_();
};
goog.net.WrapperXmlHttpFactory.prototype.getOptions = function() {
  return this.optionsFactory_();
};
goog.provide("goog.net.DefaultXmlHttpFactory");
goog.provide("goog.net.XmlHttp");
goog.provide("goog.net.XmlHttp.OptionType");
goog.provide("goog.net.XmlHttp.ReadyState");
goog.provide("goog.net.XmlHttpDefines");
goog.require("goog.asserts");
goog.require("goog.net.WrapperXmlHttpFactory");
goog.require("goog.net.XmlHttpFactory");
goog.net.XmlHttp = function() {
  return goog.net.XmlHttp.factory_.createInstance();
};
goog.define("goog.net.XmlHttp.ASSUME_NATIVE_XHR", false);
goog.net.XmlHttpDefines = {};
goog.define("goog.net.XmlHttpDefines.ASSUME_NATIVE_XHR", false);
goog.net.XmlHttp.getOptions = function() {
  return goog.net.XmlHttp.factory_.getOptions();
};
goog.net.XmlHttp.OptionType = {USE_NULL_FUNCTION:0, LOCAL_REQUEST_ERROR:1};
goog.net.XmlHttp.ReadyState = {UNINITIALIZED:0, LOADING:1, LOADED:2, INTERACTIVE:3, COMPLETE:4};
goog.net.XmlHttp.factory_;
goog.net.XmlHttp.setFactory = function(factory, optionsFactory) {
  goog.net.XmlHttp.setGlobalFactory(new goog.net.WrapperXmlHttpFactory(goog.asserts.assert(factory), goog.asserts.assert(optionsFactory)));
};
goog.net.XmlHttp.setGlobalFactory = function(factory) {
  goog.net.XmlHttp.factory_ = factory;
};
goog.net.DefaultXmlHttpFactory = function() {
  goog.net.XmlHttpFactory.call(this);
};
goog.inherits(goog.net.DefaultXmlHttpFactory, goog.net.XmlHttpFactory);
goog.net.DefaultXmlHttpFactory.prototype.createInstance = function() {
  var progId = this.getProgId_();
  if (progId) {
    return new ActiveXObject(progId);
  } else {
    return new XMLHttpRequest;
  }
};
goog.net.DefaultXmlHttpFactory.prototype.internalGetOptions = function() {
  var progId = this.getProgId_();
  var options = {};
  if (progId) {
    options[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] = true;
    options[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] = true;
  }
  return options;
};
goog.net.DefaultXmlHttpFactory.prototype.ieProgId_;
goog.net.DefaultXmlHttpFactory.prototype.getProgId_ = function() {
  if (goog.net.XmlHttp.ASSUME_NATIVE_XHR || goog.net.XmlHttpDefines.ASSUME_NATIVE_XHR) {
    return "";
  }
  if (!this.ieProgId_ && typeof XMLHttpRequest == "undefined" && typeof ActiveXObject != "undefined") {
    var ACTIVE_X_IDENTS = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
    for (var i = 0;i < ACTIVE_X_IDENTS.length;i++) {
      var candidate = ACTIVE_X_IDENTS[i];
      try {
        new ActiveXObject(candidate);
        this.ieProgId_ = candidate;
        return candidate;
      } catch (e) {
      }
    }
    throw Error("Could not create ActiveXObject. ActiveX might be disabled," + " or MSXML might not be installed");
  }
  return (this.ieProgId_);
};
goog.net.XmlHttp.setGlobalFactory(new goog.net.DefaultXmlHttpFactory);
goog.provide("goog.net.EventType");
goog.net.EventType = {COMPLETE:"complete", SUCCESS:"success", ERROR:"error", ABORT:"abort", READY:"ready", READY_STATE_CHANGE:"readystatechange", TIMEOUT:"timeout", INCREMENTAL_DATA:"incrementaldata", PROGRESS:"progress", DOWNLOAD_PROGRESS:"downloadprogress", UPLOAD_PROGRESS:"uploadprogress"};
goog.provide("goog.Thenable");
goog.Thenable = function() {
};
goog.Thenable.prototype.then = function(opt_onFulfilled, opt_onRejected, opt_context) {
};
goog.Thenable.IMPLEMENTED_BY_PROP = "$goog_Thenable";
goog.Thenable.addImplementation = function(ctor) {
  goog.exportProperty(ctor.prototype, "then", ctor.prototype.then);
  if (COMPILED) {
    ctor.prototype[goog.Thenable.IMPLEMENTED_BY_PROP] = true;
  } else {
    ctor.prototype.$goog_Thenable = true;
  }
};
goog.Thenable.isImplementedBy = function(object) {
  if (!object) {
    return false;
  }
  try {
    if (COMPILED) {
      return !!object[goog.Thenable.IMPLEMENTED_BY_PROP];
    }
    return !!object.$goog_Thenable;
  } catch (e) {
    return false;
  }
};
goog.provide("goog.async.FreeList");
goog.async.FreeList = goog.defineClass(null, {constructor:function(create, reset, limit) {
  this.limit_ = limit;
  this.create_ = create;
  this.reset_ = reset;
  this.occupants_ = 0;
  this.head_ = null;
}, get:function() {
  var item;
  if (this.occupants_ > 0) {
    this.occupants_--;
    item = this.head_;
    this.head_ = item.next;
    item.next = null;
  } else {
    item = this.create_();
  }
  return item;
}, put:function(item) {
  this.reset_(item);
  if (this.occupants_ < this.limit_) {
    this.occupants_++;
    item.next = this.head_;
    this.head_ = item;
  }
}, occupants:function() {
  return this.occupants_;
}});
goog.provide("goog.async.WorkItem");
goog.provide("goog.async.WorkQueue");
goog.require("goog.asserts");
goog.require("goog.async.FreeList");
goog.async.WorkQueue = function() {
  this.workHead_ = null;
  this.workTail_ = null;
};
goog.define("goog.async.WorkQueue.DEFAULT_MAX_UNUSED", 100);
goog.async.WorkQueue.freelist_ = new goog.async.FreeList(function() {
  return new goog.async.WorkItem;
}, function(item) {
  item.reset();
}, goog.async.WorkQueue.DEFAULT_MAX_UNUSED);
goog.async.WorkQueue.prototype.add = function(fn, scope) {
  var item = this.getUnusedItem_();
  item.set(fn, scope);
  if (this.workTail_) {
    this.workTail_.next = item;
    this.workTail_ = item;
  } else {
    goog.asserts.assert(!this.workHead_);
    this.workHead_ = item;
    this.workTail_ = item;
  }
};
goog.async.WorkQueue.prototype.remove = function() {
  var item = null;
  if (this.workHead_) {
    item = this.workHead_;
    this.workHead_ = this.workHead_.next;
    if (!this.workHead_) {
      this.workTail_ = null;
    }
    item.next = null;
  }
  return item;
};
goog.async.WorkQueue.prototype.returnUnused = function(item) {
  goog.async.WorkQueue.freelist_.put(item);
};
goog.async.WorkQueue.prototype.getUnusedItem_ = function() {
  return goog.async.WorkQueue.freelist_.get();
};
goog.async.WorkItem = function() {
  this.fn = null;
  this.scope = null;
  this.next = null;
};
goog.async.WorkItem.prototype.set = function(fn, scope) {
  this.fn = fn;
  this.scope = scope;
  this.next = null;
};
goog.async.WorkItem.prototype.reset = function() {
  this.fn = null;
  this.scope = null;
  this.next = null;
};
goog.provide("goog.async.nextTick");
goog.provide("goog.async.throwException");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.dom.TagName");
goog.require("goog.functions");
goog.require("goog.labs.userAgent.browser");
goog.require("goog.labs.userAgent.engine");
goog.async.throwException = function(exception) {
  goog.global.setTimeout(function() {
    throw exception;
  }, 0);
};
goog.async.nextTick = function(callback, opt_context, opt_useSetImmediate) {
  var cb = callback;
  if (opt_context) {
    cb = goog.bind(callback, opt_context);
  }
  cb = goog.async.nextTick.wrapCallback_(cb);
  if (goog.isFunction(goog.global.setImmediate) && (opt_useSetImmediate || goog.async.nextTick.useSetImmediate_())) {
    goog.global.setImmediate(cb);
    return;
  }
  if (!goog.async.nextTick.setImmediate_) {
    goog.async.nextTick.setImmediate_ = goog.async.nextTick.getSetImmediateEmulator_();
  }
  goog.async.nextTick.setImmediate_(cb);
};
goog.async.nextTick.useSetImmediate_ = function() {
  if (!goog.global.Window || !goog.global.Window.prototype) {
    return true;
  }
  if (goog.labs.userAgent.browser.isEdge() || goog.global.Window.prototype.setImmediate != goog.global.setImmediate) {
    return true;
  }
  return false;
};
goog.async.nextTick.setImmediate_;
goog.async.nextTick.getSetImmediateEmulator_ = function() {
  var Channel = goog.global["MessageChannel"];
  if (typeof Channel === "undefined" && typeof window !== "undefined" && window.postMessage && window.addEventListener && !goog.labs.userAgent.engine.isPresto()) {
    Channel = function() {
      var iframe = (document.createElement(goog.dom.TagName.IFRAME));
      iframe.style.display = "none";
      iframe.src = "";
      document.documentElement.appendChild(iframe);
      var win = iframe.contentWindow;
      var doc = win.document;
      doc.open();
      doc.write("");
      doc.close();
      var message = "callImmediate" + Math.random();
      var origin = win.location.protocol == "file:" ? "*" : win.location.protocol + "//" + win.location.host;
      var onmessage = goog.bind(function(e) {
        if (origin != "*" && e.origin != origin || e.data != message) {
          return;
        }
        this["port1"].onmessage();
      }, this);
      win.addEventListener("message", onmessage, false);
      this["port1"] = {};
      this["port2"] = {postMessage:function() {
        win.postMessage(message, origin);
      }};
    };
  }
  if (typeof Channel !== "undefined" && !goog.labs.userAgent.browser.isIE()) {
    var channel = new Channel;
    var head = {};
    var tail = head;
    channel["port1"].onmessage = function() {
      if (goog.isDef(head.next)) {
        head = head.next;
        var cb = head.cb;
        head.cb = null;
        cb();
      }
    };
    return function(cb) {
      tail.next = {cb:cb};
      tail = tail.next;
      channel["port2"].postMessage(0);
    };
  }
  if (typeof document !== "undefined" && "onreadystatechange" in document.createElement(goog.dom.TagName.SCRIPT)) {
    return function(cb) {
      var script = document.createElement(goog.dom.TagName.SCRIPT);
      script.onreadystatechange = function() {
        script.onreadystatechange = null;
        script.parentNode.removeChild(script);
        script = null;
        cb();
        cb = null;
      };
      document.documentElement.appendChild(script);
    };
  }
  return function(cb) {
    goog.global.setTimeout(cb, 0);
  };
};
goog.async.nextTick.wrapCallback_ = goog.functions.identity;
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.async.nextTick.wrapCallback_ = transformer;
});
goog.provide("goog.async.run");
goog.require("goog.async.WorkQueue");
goog.require("goog.async.nextTick");
goog.require("goog.async.throwException");
goog.async.run = function(callback, opt_context) {
  if (!goog.async.run.schedule_) {
    goog.async.run.initializeRunner_();
  }
  if (!goog.async.run.workQueueScheduled_) {
    goog.async.run.schedule_();
    goog.async.run.workQueueScheduled_ = true;
  }
  goog.async.run.workQueue_.add(callback, opt_context);
};
goog.async.run.initializeRunner_ = function() {
  if (goog.global.Promise && goog.global.Promise.resolve) {
    var promise = goog.global.Promise.resolve(undefined);
    goog.async.run.schedule_ = function() {
      promise.then(goog.async.run.processWorkQueue);
    };
  } else {
    goog.async.run.schedule_ = function() {
      goog.async.nextTick(goog.async.run.processWorkQueue);
    };
  }
};
goog.async.run.forceNextTick = function(opt_realSetTimeout) {
  goog.async.run.schedule_ = function() {
    goog.async.nextTick(goog.async.run.processWorkQueue);
    if (opt_realSetTimeout) {
      opt_realSetTimeout(goog.async.run.processWorkQueue);
    }
  };
};
goog.async.run.schedule_;
goog.async.run.workQueueScheduled_ = false;
goog.async.run.workQueue_ = new goog.async.WorkQueue;
if (goog.DEBUG) {
  goog.async.run.resetQueue = function() {
    goog.async.run.workQueueScheduled_ = false;
    goog.async.run.workQueue_ = new goog.async.WorkQueue;
  };
}
goog.async.run.processWorkQueue = function() {
  var item = null;
  while (item = goog.async.run.workQueue_.remove()) {
    try {
      item.fn.call(item.scope);
    } catch (e) {
      goog.async.throwException(e);
    }
    goog.async.run.workQueue_.returnUnused(item);
  }
  goog.async.run.workQueueScheduled_ = false;
};
goog.provide("goog.promise.Resolver");
goog.promise.Resolver = function() {
};
goog.promise.Resolver.prototype.promise;
goog.promise.Resolver.prototype.resolve;
goog.promise.Resolver.prototype.reject;
goog.provide("goog.Promise");
goog.require("goog.Thenable");
goog.require("goog.asserts");
goog.require("goog.async.FreeList");
goog.require("goog.async.run");
goog.require("goog.async.throwException");
goog.require("goog.debug.Error");
goog.require("goog.promise.Resolver");
goog.Promise = function(resolver, opt_context) {
  this.state_ = goog.Promise.State_.PENDING;
  this.result_ = undefined;
  this.parent_ = null;
  this.callbackEntries_ = null;
  this.callbackEntriesTail_ = null;
  this.executing_ = false;
  if (goog.Promise.UNHANDLED_REJECTION_DELAY > 0) {
    this.unhandledRejectionId_ = 0;
  } else {
    if (goog.Promise.UNHANDLED_REJECTION_DELAY == 0) {
      this.hadUnhandledRejection_ = false;
    }
  }
  if (goog.Promise.LONG_STACK_TRACES) {
    this.stack_ = [];
    this.addStackTrace_(new Error("created"));
    this.currentStep_ = 0;
  }
  if (resolver != goog.nullFunction) {
    try {
      var self = this;
      resolver.call(opt_context, function(value) {
        self.resolve_(goog.Promise.State_.FULFILLED, value);
      }, function(reason) {
        if (goog.DEBUG && !(reason instanceof goog.Promise.CancellationError)) {
          try {
            if (reason instanceof Error) {
              throw reason;
            } else {
              throw new Error("Promise rejected.");
            }
          } catch (e) {
          }
        }
        self.resolve_(goog.Promise.State_.REJECTED, reason);
      });
    } catch (e) {
      this.resolve_(goog.Promise.State_.REJECTED, e);
    }
  }
};
goog.define("goog.Promise.LONG_STACK_TRACES", false);
goog.define("goog.Promise.UNHANDLED_REJECTION_DELAY", 0);
goog.Promise.State_ = {PENDING:0, BLOCKED:1, FULFILLED:2, REJECTED:3};
goog.Promise.CallbackEntry_ = function() {
  this.child = null;
  this.onFulfilled = null;
  this.onRejected = null;
  this.context = null;
  this.next = null;
  this.always = false;
};
goog.Promise.CallbackEntry_.prototype.reset = function() {
  this.child = null;
  this.onFulfilled = null;
  this.onRejected = null;
  this.context = null;
  this.always = false;
};
goog.define("goog.Promise.DEFAULT_MAX_UNUSED", 100);
goog.Promise.freelist_ = new goog.async.FreeList(function() {
  return new goog.Promise.CallbackEntry_;
}, function(item) {
  item.reset();
}, goog.Promise.DEFAULT_MAX_UNUSED);
goog.Promise.getCallbackEntry_ = function(onFulfilled, onRejected, context) {
  var entry = goog.Promise.freelist_.get();
  entry.onFulfilled = onFulfilled;
  entry.onRejected = onRejected;
  entry.context = context;
  return entry;
};
goog.Promise.returnEntry_ = function(entry) {
  goog.Promise.freelist_.put(entry);
};
goog.Promise.resolve = function(opt_value) {
  if (opt_value instanceof goog.Promise) {
    return opt_value;
  }
  var promise = new goog.Promise(goog.nullFunction);
  promise.resolve_(goog.Promise.State_.FULFILLED, opt_value);
  return promise;
};
goog.Promise.reject = function(opt_reason) {
  return new goog.Promise(function(resolve, reject) {
    reject(opt_reason);
  });
};
goog.Promise.resolveThen_ = function(value, onFulfilled, onRejected) {
  var isThenable = goog.Promise.maybeThen_(value, onFulfilled, onRejected, null);
  if (!isThenable) {
    goog.async.run(goog.partial(onFulfilled, value));
  }
};
goog.Promise.race = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    if (!promises.length) {
      resolve(undefined);
    }
    for (var i = 0, promise;i < promises.length;i++) {
      promise = promises[i];
      goog.Promise.resolveThen_(promise, resolve, reject);
    }
  });
};
goog.Promise.all = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    var toFulfill = promises.length;
    var values = [];
    if (!toFulfill) {
      resolve(values);
      return;
    }
    var onFulfill = function(index, value) {
      toFulfill--;
      values[index] = value;
      if (toFulfill == 0) {
        resolve(values);
      }
    };
    var onReject = function(reason) {
      reject(reason);
    };
    for (var i = 0, promise;i < promises.length;i++) {
      promise = promises[i];
      goog.Promise.resolveThen_(promise, goog.partial(onFulfill, i), onReject);
    }
  });
};
goog.Promise.allSettled = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    var toSettle = promises.length;
    var results = [];
    if (!toSettle) {
      resolve(results);
      return;
    }
    var onSettled = function(index, fulfilled, result) {
      toSettle--;
      results[index] = fulfilled ? {fulfilled:true, value:result} : {fulfilled:false, reason:result};
      if (toSettle == 0) {
        resolve(results);
      }
    };
    for (var i = 0, promise;i < promises.length;i++) {
      promise = promises[i];
      goog.Promise.resolveThen_(promise, goog.partial(onSettled, i, true), goog.partial(onSettled, i, false));
    }
  });
};
goog.Promise.firstFulfilled = function(promises) {
  return new goog.Promise(function(resolve, reject) {
    var toReject = promises.length;
    var reasons = [];
    if (!toReject) {
      resolve(undefined);
      return;
    }
    var onFulfill = function(value) {
      resolve(value);
    };
    var onReject = function(index, reason) {
      toReject--;
      reasons[index] = reason;
      if (toReject == 0) {
        reject(reasons);
      }
    };
    for (var i = 0, promise;i < promises.length;i++) {
      promise = promises[i];
      goog.Promise.resolveThen_(promise, onFulfill, goog.partial(onReject, i));
    }
  });
};
goog.Promise.withResolver = function() {
  var resolve, reject;
  var promise = new goog.Promise(function(rs, rj) {
    resolve = rs;
    reject = rj;
  });
  return new goog.Promise.Resolver_(promise, resolve, reject);
};
goog.Promise.prototype.then = function(opt_onFulfilled, opt_onRejected, opt_context) {
  if (opt_onFulfilled != null) {
    goog.asserts.assertFunction(opt_onFulfilled, "opt_onFulfilled should be a function.");
  }
  if (opt_onRejected != null) {
    goog.asserts.assertFunction(opt_onRejected, "opt_onRejected should be a function. Did you pass opt_context " + "as the second argument instead of the third?");
  }
  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error("then"));
  }
  return this.addChildPromise_(goog.isFunction(opt_onFulfilled) ? opt_onFulfilled : null, goog.isFunction(opt_onRejected) ? opt_onRejected : null, opt_context);
};
goog.Thenable.addImplementation(goog.Promise);
goog.Promise.prototype.thenVoid = function(opt_onFulfilled, opt_onRejected, opt_context) {
  if (opt_onFulfilled != null) {
    goog.asserts.assertFunction(opt_onFulfilled, "opt_onFulfilled should be a function.");
  }
  if (opt_onRejected != null) {
    goog.asserts.assertFunction(opt_onRejected, "opt_onRejected should be a function. Did you pass opt_context " + "as the second argument instead of the third?");
  }
  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error("then"));
  }
  this.addCallbackEntry_(goog.Promise.getCallbackEntry_(opt_onFulfilled || goog.nullFunction, opt_onRejected || null, opt_context));
};
goog.Promise.prototype.thenAlways = function(onSettled, opt_context) {
  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error("thenAlways"));
  }
  var entry = goog.Promise.getCallbackEntry_(onSettled, onSettled, opt_context);
  entry.always = true;
  this.addCallbackEntry_(entry);
  return this;
};
goog.Promise.prototype.thenCatch = function(onRejected, opt_context) {
  if (goog.Promise.LONG_STACK_TRACES) {
    this.addStackTrace_(new Error("thenCatch"));
  }
  return this.addChildPromise_(null, onRejected, opt_context);
};
goog.Promise.prototype.cancel = function(opt_message) {
  if (this.state_ == goog.Promise.State_.PENDING) {
    goog.async.run(function() {
      var err = new goog.Promise.CancellationError(opt_message);
      this.cancelInternal_(err);
    }, this);
  }
};
goog.Promise.prototype.cancelInternal_ = function(err) {
  if (this.state_ == goog.Promise.State_.PENDING) {
    if (this.parent_) {
      this.parent_.cancelChild_(this, err);
      this.parent_ = null;
    } else {
      this.resolve_(goog.Promise.State_.REJECTED, err);
    }
  }
};
goog.Promise.prototype.cancelChild_ = function(childPromise, err) {
  if (!this.callbackEntries_) {
    return;
  }
  var childCount = 0;
  var childEntry = null;
  var beforeChildEntry = null;
  for (var entry = this.callbackEntries_;entry;entry = entry.next) {
    if (!entry.always) {
      childCount++;
      if (entry.child == childPromise) {
        childEntry = entry;
      }
      if (childEntry && childCount > 1) {
        break;
      }
    }
    if (!childEntry) {
      beforeChildEntry = entry;
    }
  }
  if (childEntry) {
    if (this.state_ == goog.Promise.State_.PENDING && childCount == 1) {
      this.cancelInternal_(err);
    } else {
      if (beforeChildEntry) {
        this.removeEntryAfter_(beforeChildEntry);
      } else {
        this.popEntry_();
      }
      this.executeCallback_(childEntry, goog.Promise.State_.REJECTED, err);
    }
  }
};
goog.Promise.prototype.addCallbackEntry_ = function(callbackEntry) {
  if (!this.hasEntry_() && (this.state_ == goog.Promise.State_.FULFILLED || this.state_ == goog.Promise.State_.REJECTED)) {
    this.scheduleCallbacks_();
  }
  this.queueEntry_(callbackEntry);
};
goog.Promise.prototype.addChildPromise_ = function(onFulfilled, onRejected, opt_context) {
  var callbackEntry = goog.Promise.getCallbackEntry_(null, null, null);
  callbackEntry.child = new goog.Promise(function(resolve, reject) {
    callbackEntry.onFulfilled = onFulfilled ? function(value) {
      try {
        var result = onFulfilled.call(opt_context, value);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    } : resolve;
    callbackEntry.onRejected = onRejected ? function(reason) {
      try {
        var result = onRejected.call(opt_context, reason);
        if (!goog.isDef(result) && reason instanceof goog.Promise.CancellationError) {
          reject(reason);
        } else {
          resolve(result);
        }
      } catch (err) {
        reject(err);
      }
    } : reject;
  });
  callbackEntry.child.parent_ = this;
  this.addCallbackEntry_(callbackEntry);
  return callbackEntry.child;
};
goog.Promise.prototype.unblockAndFulfill_ = function(value) {
  goog.asserts.assert(this.state_ == goog.Promise.State_.BLOCKED);
  this.state_ = goog.Promise.State_.PENDING;
  this.resolve_(goog.Promise.State_.FULFILLED, value);
};
goog.Promise.prototype.unblockAndReject_ = function(reason) {
  goog.asserts.assert(this.state_ == goog.Promise.State_.BLOCKED);
  this.state_ = goog.Promise.State_.PENDING;
  this.resolve_(goog.Promise.State_.REJECTED, reason);
};
goog.Promise.prototype.resolve_ = function(state, x) {
  if (this.state_ != goog.Promise.State_.PENDING) {
    return;
  }
  if (this == x) {
    state = goog.Promise.State_.REJECTED;
    x = new TypeError("Promise cannot resolve to itself");
  }
  this.state_ = goog.Promise.State_.BLOCKED;
  var isThenable = goog.Promise.maybeThen_(x, this.unblockAndFulfill_, this.unblockAndReject_, this);
  if (isThenable) {
    return;
  }
  this.result_ = x;
  this.state_ = state;
  this.parent_ = null;
  this.scheduleCallbacks_();
  if (state == goog.Promise.State_.REJECTED && !(x instanceof goog.Promise.CancellationError)) {
    goog.Promise.addUnhandledRejection_(this, x);
  }
};
goog.Promise.maybeThen_ = function(value, onFulfilled, onRejected, context) {
  if (value instanceof goog.Promise) {
    value.thenVoid(onFulfilled, onRejected, context);
    return true;
  } else {
    if (goog.Thenable.isImplementedBy(value)) {
      value = (value);
      value.then(onFulfilled, onRejected, context);
      return true;
    } else {
      if (goog.isObject(value)) {
        try {
          var then = value["then"];
          if (goog.isFunction(then)) {
            goog.Promise.tryThen_(value, then, onFulfilled, onRejected, context);
            return true;
          }
        } catch (e) {
          onRejected.call(context, e);
          return true;
        }
      }
    }
  }
  return false;
};
goog.Promise.tryThen_ = function(thenable, then, onFulfilled, onRejected, context) {
  var called = false;
  var resolve = function(value) {
    if (!called) {
      called = true;
      onFulfilled.call(context, value);
    }
  };
  var reject = function(reason) {
    if (!called) {
      called = true;
      onRejected.call(context, reason);
    }
  };
  try {
    then.call(thenable, resolve, reject);
  } catch (e) {
    reject(e);
  }
};
goog.Promise.prototype.scheduleCallbacks_ = function() {
  if (!this.executing_) {
    this.executing_ = true;
    goog.async.run(this.executeCallbacks_, this);
  }
};
goog.Promise.prototype.hasEntry_ = function() {
  return !!this.callbackEntries_;
};
goog.Promise.prototype.queueEntry_ = function(entry) {
  goog.asserts.assert(entry.onFulfilled != null);
  if (this.callbackEntriesTail_) {
    this.callbackEntriesTail_.next = entry;
    this.callbackEntriesTail_ = entry;
  } else {
    this.callbackEntries_ = entry;
    this.callbackEntriesTail_ = entry;
  }
};
goog.Promise.prototype.popEntry_ = function() {
  var entry = null;
  if (this.callbackEntries_) {
    entry = this.callbackEntries_;
    this.callbackEntries_ = entry.next;
    entry.next = null;
  }
  if (!this.callbackEntries_) {
    this.callbackEntriesTail_ = null;
  }
  if (entry != null) {
    goog.asserts.assert(entry.onFulfilled != null);
  }
  return entry;
};
goog.Promise.prototype.removeEntryAfter_ = function(previous) {
  goog.asserts.assert(this.callbackEntries_);
  goog.asserts.assert(previous != null);
  if (previous.next == this.callbackEntriesTail_) {
    this.callbackEntriesTail_ = previous;
  }
  previous.next = previous.next.next;
};
goog.Promise.prototype.executeCallbacks_ = function() {
  var entry = null;
  while (entry = this.popEntry_()) {
    if (goog.Promise.LONG_STACK_TRACES) {
      this.currentStep_++;
    }
    this.executeCallback_(entry, this.state_, this.result_);
  }
  this.executing_ = false;
};
goog.Promise.prototype.executeCallback_ = function(callbackEntry, state, result) {
  if (state == goog.Promise.State_.REJECTED && callbackEntry.onRejected && !callbackEntry.always) {
    this.removeUnhandledRejection_();
  }
  if (callbackEntry.child) {
    callbackEntry.child.parent_ = null;
    goog.Promise.invokeCallback_(callbackEntry, state, result);
  } else {
    try {
      callbackEntry.always ? callbackEntry.onFulfilled.call(callbackEntry.context) : goog.Promise.invokeCallback_(callbackEntry, state, result);
    } catch (err) {
      goog.Promise.handleRejection_.call(null, err);
    }
  }
  goog.Promise.returnEntry_(callbackEntry);
};
goog.Promise.invokeCallback_ = function(callbackEntry, state, result) {
  if (state == goog.Promise.State_.FULFILLED) {
    callbackEntry.onFulfilled.call(callbackEntry.context, result);
  } else {
    if (callbackEntry.onRejected) {
      callbackEntry.onRejected.call(callbackEntry.context, result);
    }
  }
};
goog.Promise.prototype.addStackTrace_ = function(err) {
  if (goog.Promise.LONG_STACK_TRACES && goog.isString(err.stack)) {
    var trace = err.stack.split("\n", 4)[3];
    var message = err.message;
    message += Array(11 - message.length).join(" ");
    this.stack_.push(message + trace);
  }
};
goog.Promise.prototype.appendLongStack_ = function(err) {
  if (goog.Promise.LONG_STACK_TRACES && err && goog.isString(err.stack) && this.stack_.length) {
    var longTrace = ["Promise trace:"];
    for (var promise = this;promise;promise = promise.parent_) {
      for (var i = this.currentStep_;i >= 0;i--) {
        longTrace.push(promise.stack_[i]);
      }
      longTrace.push("Value: " + "[" + (promise.state_ == goog.Promise.State_.REJECTED ? "REJECTED" : "FULFILLED") + "] " + "<" + String(promise.result_) + ">");
    }
    err.stack += "\n\n" + longTrace.join("\n");
  }
};
goog.Promise.prototype.removeUnhandledRejection_ = function() {
  if (goog.Promise.UNHANDLED_REJECTION_DELAY > 0) {
    for (var p = this;p && p.unhandledRejectionId_;p = p.parent_) {
      goog.global.clearTimeout(p.unhandledRejectionId_);
      p.unhandledRejectionId_ = 0;
    }
  } else {
    if (goog.Promise.UNHANDLED_REJECTION_DELAY == 0) {
      for (var p = this;p && p.hadUnhandledRejection_;p = p.parent_) {
        p.hadUnhandledRejection_ = false;
      }
    }
  }
};
goog.Promise.addUnhandledRejection_ = function(promise, reason) {
  if (goog.Promise.UNHANDLED_REJECTION_DELAY > 0) {
    promise.unhandledRejectionId_ = goog.global.setTimeout(function() {
      promise.appendLongStack_(reason);
      goog.Promise.handleRejection_.call(null, reason);
    }, goog.Promise.UNHANDLED_REJECTION_DELAY);
  } else {
    if (goog.Promise.UNHANDLED_REJECTION_DELAY == 0) {
      promise.hadUnhandledRejection_ = true;
      goog.async.run(function() {
        if (promise.hadUnhandledRejection_) {
          promise.appendLongStack_(reason);
          goog.Promise.handleRejection_.call(null, reason);
        }
      });
    }
  }
};
goog.Promise.handleRejection_ = goog.async.throwException;
goog.Promise.setUnhandledRejectionHandler = function(handler) {
  goog.Promise.handleRejection_ = handler;
};
goog.Promise.CancellationError = function(opt_message) {
  goog.Promise.CancellationError.base(this, "constructor", opt_message);
};
goog.inherits(goog.Promise.CancellationError, goog.debug.Error);
goog.Promise.CancellationError.prototype.name = "cancel";
goog.Promise.Resolver_ = function(promise, resolve, reject) {
  this.promise = promise;
  this.resolve = resolve;
  this.reject = reject;
};
goog.provide("goog.Timer");
goog.require("goog.Promise");
goog.require("goog.events.EventTarget");
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);
  this.interval_ = opt_interval || 1;
  this.timerObject_ = (opt_timerObject || goog.Timer.defaultTimerObject);
  this.boundTick_ = goog.bind(this.tick_, this);
  this.last_ = goog.now();
};
goog.inherits(goog.Timer, goog.events.EventTarget);
goog.Timer.MAX_TIMEOUT_ = 2147483647;
goog.Timer.INVALID_TIMEOUT_ID_ = -1;
goog.Timer.prototype.enabled = false;
goog.Timer.defaultTimerObject = goog.global;
goog.Timer.intervalScale = .8;
goog.Timer.prototype.timer_ = null;
goog.Timer.prototype.getInterval = function() {
  return this.interval_;
};
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if (this.timer_ && this.enabled) {
    this.stop();
    this.start();
  } else {
    if (this.timer_) {
      this.stop();
    }
  }
};
goog.Timer.prototype.tick_ = function() {
  if (this.enabled) {
    var elapsed = goog.now() - this.last_;
    if (elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_ - elapsed);
      return;
    }
    if (this.timer_) {
      this.timerObject_.clearTimeout(this.timer_);
      this.timer_ = null;
    }
    this.dispatchTick();
    if (this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
      this.last_ = goog.now();
    }
  }
};
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK);
};
goog.Timer.prototype.start = function() {
  this.enabled = true;
  if (!this.timer_) {
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
    this.last_ = goog.now();
  }
};
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if (this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null;
  }
};
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_;
};
goog.Timer.TICK = "tick";
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) {
  if (goog.isFunction(listener)) {
    if (opt_handler) {
      listener = goog.bind(listener, opt_handler);
    }
  } else {
    if (listener && typeof listener.handleEvent == "function") {
      listener = goog.bind(listener.handleEvent, listener);
    } else {
      throw Error("Invalid listener argument");
    }
  }
  if (Number(opt_delay) > goog.Timer.MAX_TIMEOUT_) {
    return goog.Timer.INVALID_TIMEOUT_ID_;
  } else {
    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0);
  }
};
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId);
};
goog.Timer.promise = function(delay, opt_result) {
  var timerKey = null;
  return (new goog.Promise(function(resolve, reject) {
    timerKey = goog.Timer.callOnce(function() {
      resolve(opt_result);
    }, delay);
    if (timerKey == goog.Timer.INVALID_TIMEOUT_ID_) {
      reject(new Error("Failed to schedule timer."));
    }
  })).thenCatch(function(error) {
    goog.Timer.clear(timerKey);
    throw error;
  });
};
goog.provide("goog.net.HttpStatus");
goog.net.HttpStatus = {CONTINUE:100, SWITCHING_PROTOCOLS:101, OK:200, CREATED:201, ACCEPTED:202, NON_AUTHORITATIVE_INFORMATION:203, NO_CONTENT:204, RESET_CONTENT:205, PARTIAL_CONTENT:206, MULTIPLE_CHOICES:300, MOVED_PERMANENTLY:301, FOUND:302, SEE_OTHER:303, NOT_MODIFIED:304, USE_PROXY:305, TEMPORARY_REDIRECT:307, BAD_REQUEST:400, UNAUTHORIZED:401, PAYMENT_REQUIRED:402, FORBIDDEN:403, NOT_FOUND:404, METHOD_NOT_ALLOWED:405, NOT_ACCEPTABLE:406, PROXY_AUTHENTICATION_REQUIRED:407, REQUEST_TIMEOUT:408, 
CONFLICT:409, GONE:410, LENGTH_REQUIRED:411, PRECONDITION_FAILED:412, REQUEST_ENTITY_TOO_LARGE:413, REQUEST_URI_TOO_LONG:414, UNSUPPORTED_MEDIA_TYPE:415, REQUEST_RANGE_NOT_SATISFIABLE:416, EXPECTATION_FAILED:417, PRECONDITION_REQUIRED:428, TOO_MANY_REQUESTS:429, REQUEST_HEADER_FIELDS_TOO_LARGE:431, INTERNAL_SERVER_ERROR:500, NOT_IMPLEMENTED:501, BAD_GATEWAY:502, SERVICE_UNAVAILABLE:503, GATEWAY_TIMEOUT:504, HTTP_VERSION_NOT_SUPPORTED:505, NETWORK_AUTHENTICATION_REQUIRED:511, QUIRK_IE_NO_CONTENT:1223};
goog.net.HttpStatus.isSuccess = function(status) {
  switch(status) {
    case goog.net.HttpStatus.OK:
    ;
    case goog.net.HttpStatus.CREATED:
    ;
    case goog.net.HttpStatus.ACCEPTED:
    ;
    case goog.net.HttpStatus.NO_CONTENT:
    ;
    case goog.net.HttpStatus.PARTIAL_CONTENT:
    ;
    case goog.net.HttpStatus.NOT_MODIFIED:
    ;
    case goog.net.HttpStatus.QUIRK_IE_NO_CONTENT:
      return true;
    default:
      return false;
  }
};
goog.provide("goog.net.XhrIo");
goog.provide("goog.net.XhrIo.ResponseType");
goog.require("goog.Timer");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.events.EventTarget");
goog.require("goog.json");
goog.require("goog.log");
goog.require("goog.net.ErrorCode");
goog.require("goog.net.EventType");
goog.require("goog.net.HttpStatus");
goog.require("goog.net.XmlHttp");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.structs");
goog.require("goog.structs.Map");
goog.require("goog.uri.utils");
goog.require("goog.userAgent");
goog.forwardDeclare("goog.Uri");
goog.net.XhrIo = function(opt_xmlHttpFactory) {
  goog.net.XhrIo.base(this, "constructor");
  this.headers = new goog.structs.Map;
  this.xmlHttpFactory_ = opt_xmlHttpFactory || null;
  this.active_ = false;
  this.xhr_ = null;
  this.xhrOptions_ = null;
  this.lastUri_ = "";
  this.lastMethod_ = "";
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.lastError_ = "";
  this.errorDispatched_ = false;
  this.inSend_ = false;
  this.inOpen_ = false;
  this.inAbort_ = false;
  this.timeoutInterval_ = 0;
  this.timeoutId_ = null;
  this.responseType_ = goog.net.XhrIo.ResponseType.DEFAULT;
  this.withCredentials_ = false;
  this.progressEventsEnabled_ = false;
  this.useXhr2Timeout_ = false;
};
goog.inherits(goog.net.XhrIo, goog.events.EventTarget);
goog.net.XhrIo.ResponseType = {DEFAULT:"", TEXT:"text", DOCUMENT:"document", BLOB:"blob", ARRAY_BUFFER:"arraybuffer"};
goog.net.XhrIo.prototype.logger_ = goog.log.getLogger("goog.net.XhrIo");
goog.net.XhrIo.CONTENT_TYPE_HEADER = "Content-Type";
goog.net.XhrIo.HTTP_SCHEME_PATTERN = /^https?$/i;
goog.net.XhrIo.METHODS_WITH_FORM_DATA = ["POST", "PUT"];
goog.net.XhrIo.FORM_CONTENT_TYPE = "application/x-www-form-urlencoded;charset=utf-8";
goog.net.XhrIo.XHR2_TIMEOUT_ = "timeout";
goog.net.XhrIo.XHR2_ON_TIMEOUT_ = "ontimeout";
goog.net.XhrIo.sendInstances_ = [];
goog.net.XhrIo.send = function(url, opt_callback, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials) {
  var x = new goog.net.XhrIo;
  goog.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    x.listen(goog.net.EventType.COMPLETE, opt_callback);
  }
  x.listenOnce(goog.net.EventType.READY, x.cleanupSend_);
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  if (opt_withCredentials) {
    x.setWithCredentials(opt_withCredentials);
  }
  x.send(url, opt_method, opt_content, opt_headers);
  return x;
};
goog.net.XhrIo.cleanup = function() {
  var instances = goog.net.XhrIo.sendInstances_;
  while (instances.length) {
    instances.pop().dispose();
  }
};
goog.net.XhrIo.protectEntryPoints = function(errorHandler) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = errorHandler.protectEntryPoint(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
};
goog.net.XhrIo.prototype.cleanupSend_ = function() {
  this.dispose();
  goog.array.remove(goog.net.XhrIo.sendInstances_, this);
};
goog.net.XhrIo.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_;
};
goog.net.XhrIo.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms);
};
goog.net.XhrIo.prototype.setResponseType = function(type) {
  this.responseType_ = type;
};
goog.net.XhrIo.prototype.getResponseType = function() {
  return this.responseType_;
};
goog.net.XhrIo.prototype.setWithCredentials = function(withCredentials) {
  this.withCredentials_ = withCredentials;
};
goog.net.XhrIo.prototype.getWithCredentials = function() {
  return this.withCredentials_;
};
goog.net.XhrIo.prototype.setProgressEventsEnabled = function(enabled) {
  this.progressEventsEnabled_ = enabled;
};
goog.net.XhrIo.prototype.getProgressEventsEnabled = function() {
  return this.progressEventsEnabled_;
};
goog.net.XhrIo.prototype.send = function(url, opt_method, opt_content, opt_headers) {
  if (this.xhr_) {
    throw Error("[goog.net.XhrIo] Object is active with another request=" + this.lastUri_ + "; newUri=" + url);
  }
  var method = opt_method ? opt_method.toUpperCase() : "GET";
  this.lastUri_ = url;
  this.lastError_ = "";
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.lastMethod_ = method;
  this.errorDispatched_ = false;
  this.active_ = true;
  this.xhr_ = this.createXhr();
  this.xhrOptions_ = this.xmlHttpFactory_ ? this.xmlHttpFactory_.getOptions() : goog.net.XmlHttp.getOptions();
  this.xhr_.onreadystatechange = goog.bind(this.onReadyStateChange_, this);
  if (this.getProgressEventsEnabled() && "onprogress" in this.xhr_) {
    this.xhr_.onprogress = goog.bind(function(e) {
      this.onProgressHandler_(e, true);
    }, this);
    if (this.xhr_.upload) {
      this.xhr_.upload.onprogress = goog.bind(this.onProgressHandler_, this);
    }
  }
  try {
    goog.log.fine(this.logger_, this.formatMsg_("Opening Xhr"));
    this.inOpen_ = true;
    this.xhr_.open(method, String(url), true);
    this.inOpen_ = false;
  } catch (err) {
    goog.log.fine(this.logger_, this.formatMsg_("Error opening Xhr: " + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
    return;
  }
  var content = opt_content || "";
  var headers = this.headers.clone();
  if (opt_headers) {
    goog.structs.forEach(opt_headers, function(value, key) {
      headers.set(key, value);
    });
  }
  var contentTypeKey = goog.array.find(headers.getKeys(), goog.net.XhrIo.isContentTypeHeader_);
  var contentIsFormData = goog.global["FormData"] && content instanceof goog.global["FormData"];
  if (goog.array.contains(goog.net.XhrIo.METHODS_WITH_FORM_DATA, method) && !contentTypeKey && !contentIsFormData) {
    headers.set(goog.net.XhrIo.CONTENT_TYPE_HEADER, goog.net.XhrIo.FORM_CONTENT_TYPE);
  }
  headers.forEach(function(value, key) {
    this.xhr_.setRequestHeader(key, value);
  }, this);
  if (this.responseType_) {
    this.xhr_.responseType = this.responseType_;
  }
  if (goog.object.containsKey(this.xhr_, "withCredentials")) {
    this.xhr_.withCredentials = this.withCredentials_;
  }
  try {
    this.cleanUpTimeoutTimer_();
    if (this.timeoutInterval_ > 0) {
      this.useXhr2Timeout_ = goog.net.XhrIo.shouldUseXhr2Timeout_(this.xhr_);
      goog.log.fine(this.logger_, this.formatMsg_("Will abort after " + this.timeoutInterval_ + "ms if incomplete, xhr2 " + this.useXhr2Timeout_));
      if (this.useXhr2Timeout_) {
        this.xhr_[goog.net.XhrIo.XHR2_TIMEOUT_] = this.timeoutInterval_;
        this.xhr_[goog.net.XhrIo.XHR2_ON_TIMEOUT_] = goog.bind(this.timeout_, this);
      } else {
        this.timeoutId_ = goog.Timer.callOnce(this.timeout_, this.timeoutInterval_, this);
      }
    }
    goog.log.fine(this.logger_, this.formatMsg_("Sending request"));
    this.inSend_ = true;
    this.xhr_.send(content);
    this.inSend_ = false;
  } catch (err$2) {
    goog.log.fine(this.logger_, this.formatMsg_("Send error: " + err$2.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err$2);
  }
};
goog.net.XhrIo.shouldUseXhr2Timeout_ = function(xhr) {
  return goog.userAgent.IE && goog.userAgent.isVersionOrHigher(9) && goog.isNumber(xhr[goog.net.XhrIo.XHR2_TIMEOUT_]) && goog.isDef(xhr[goog.net.XhrIo.XHR2_ON_TIMEOUT_]);
};
goog.net.XhrIo.isContentTypeHeader_ = function(header) {
  return goog.string.caseInsensitiveEquals(goog.net.XhrIo.CONTENT_TYPE_HEADER, header);
};
goog.net.XhrIo.prototype.createXhr = function() {
  return this.xmlHttpFactory_ ? this.xmlHttpFactory_.createInstance() : goog.net.XmlHttp();
};
goog.net.XhrIo.prototype.timeout_ = function() {
  if (typeof goog == "undefined") {
  } else {
    if (this.xhr_) {
      this.lastError_ = "Timed out after " + this.timeoutInterval_ + "ms, aborting";
      this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT;
      goog.log.fine(this.logger_, this.formatMsg_(this.lastError_));
      this.dispatchEvent(goog.net.EventType.TIMEOUT);
      this.abort(goog.net.ErrorCode.TIMEOUT);
    }
  }
};
goog.net.XhrIo.prototype.error_ = function(errorCode, err) {
  this.active_ = false;
  if (this.xhr_) {
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false;
  }
  this.lastError_ = err;
  this.lastErrorCode_ = errorCode;
  this.dispatchErrors_();
  this.cleanUpXhr_();
};
goog.net.XhrIo.prototype.dispatchErrors_ = function() {
  if (!this.errorDispatched_) {
    this.errorDispatched_ = true;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR);
  }
};
goog.net.XhrIo.prototype.abort = function(opt_failureCode) {
  if (this.xhr_ && this.active_) {
    goog.log.fine(this.logger_, this.formatMsg_("Aborting"));
    this.active_ = false;
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.cleanUpXhr_();
  }
};
goog.net.XhrIo.prototype.disposeInternal = function() {
  if (this.xhr_) {
    if (this.active_) {
      this.active_ = false;
      this.inAbort_ = true;
      this.xhr_.abort();
      this.inAbort_ = false;
    }
    this.cleanUpXhr_(true);
  }
  goog.net.XhrIo.base(this, "disposeInternal");
};
goog.net.XhrIo.prototype.onReadyStateChange_ = function() {
  if (this.isDisposed()) {
    return;
  }
  if (!this.inOpen_ && !this.inSend_ && !this.inAbort_) {
    this.onReadyStateChangeEntryPoint_();
  } else {
    this.onReadyStateChangeHelper_();
  }
};
goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = function() {
  this.onReadyStateChangeHelper_();
};
goog.net.XhrIo.prototype.onReadyStateChangeHelper_ = function() {
  if (!this.active_) {
    return;
  }
  if (typeof goog == "undefined") {
  } else {
    if (this.xhrOptions_[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] && this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE && this.getStatus() == 2) {
      goog.log.fine(this.logger_, this.formatMsg_("Local request error detected and ignored"));
    } else {
      if (this.inSend_ && this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE) {
        goog.Timer.callOnce(this.onReadyStateChange_, 0, this);
        return;
      }
      this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);
      if (this.isComplete()) {
        goog.log.fine(this.logger_, this.formatMsg_("Request complete"));
        this.active_ = false;
        try {
          if (this.isSuccess()) {
            this.dispatchEvent(goog.net.EventType.COMPLETE);
            this.dispatchEvent(goog.net.EventType.SUCCESS);
          } else {
            this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
            this.lastError_ = this.getStatusText() + " [" + this.getStatus() + "]";
            this.dispatchErrors_();
          }
        } finally {
          this.cleanUpXhr_();
        }
      }
    }
  }
};
goog.net.XhrIo.prototype.onProgressHandler_ = function(e, opt_isDownload) {
  goog.asserts.assert(e.type === goog.net.EventType.PROGRESS, "goog.net.EventType.PROGRESS is of the same type as raw XHR progress.");
  this.dispatchEvent(goog.net.XhrIo.buildProgressEvent_(e, goog.net.EventType.PROGRESS));
  this.dispatchEvent(goog.net.XhrIo.buildProgressEvent_(e, opt_isDownload ? goog.net.EventType.DOWNLOAD_PROGRESS : goog.net.EventType.UPLOAD_PROGRESS));
};
goog.net.XhrIo.buildProgressEvent_ = function(e, eventType) {
  return ({type:eventType, lengthComputable:e.lengthComputable, loaded:e.loaded, total:e.total});
};
goog.net.XhrIo.prototype.cleanUpXhr_ = function(opt_fromDispose) {
  if (this.xhr_) {
    this.cleanUpTimeoutTimer_();
    var xhr = this.xhr_;
    var clearedOnReadyStateChange = this.xhrOptions_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] ? goog.nullFunction : null;
    this.xhr_ = null;
    this.xhrOptions_ = null;
    if (!opt_fromDispose) {
      this.dispatchEvent(goog.net.EventType.READY);
    }
    try {
      xhr.onreadystatechange = clearedOnReadyStateChange;
    } catch (e) {
      goog.log.error(this.logger_, "Problem encountered resetting onreadystatechange: " + e.message);
    }
  }
};
goog.net.XhrIo.prototype.cleanUpTimeoutTimer_ = function() {
  if (this.xhr_ && this.useXhr2Timeout_) {
    this.xhr_[goog.net.XhrIo.XHR2_ON_TIMEOUT_] = null;
  }
  if (goog.isNumber(this.timeoutId_)) {
    goog.Timer.clear(this.timeoutId_);
    this.timeoutId_ = null;
  }
};
goog.net.XhrIo.prototype.isActive = function() {
  return !!this.xhr_;
};
goog.net.XhrIo.prototype.isComplete = function() {
  return this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE;
};
goog.net.XhrIo.prototype.isSuccess = function() {
  var status = this.getStatus();
  return goog.net.HttpStatus.isSuccess(status) || status === 0 && !this.isLastUriEffectiveSchemeHttp_();
};
goog.net.XhrIo.prototype.isLastUriEffectiveSchemeHttp_ = function() {
  var scheme = goog.uri.utils.getEffectiveScheme(String(this.lastUri_));
  return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(scheme);
};
goog.net.XhrIo.prototype.getReadyState = function() {
  return this.xhr_ ? (this.xhr_.readyState) : goog.net.XmlHttp.ReadyState.UNINITIALIZED;
};
goog.net.XhrIo.prototype.getStatus = function() {
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ? this.xhr_.status : -1;
  } catch (e) {
    return -1;
  }
};
goog.net.XhrIo.prototype.getStatusText = function() {
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ? this.xhr_.statusText : "";
  } catch (e) {
    goog.log.fine(this.logger_, "Can not get status: " + e.message);
    return "";
  }
};
goog.net.XhrIo.prototype.getLastUri = function() {
  return String(this.lastUri_);
};
goog.net.XhrIo.prototype.getResponseText = function() {
  try {
    return this.xhr_ ? this.xhr_.responseText : "";
  } catch (e) {
    goog.log.fine(this.logger_, "Can not get responseText: " + e.message);
    return "";
  }
};
goog.net.XhrIo.prototype.getResponseBody = function() {
  try {
    if (this.xhr_ && "responseBody" in this.xhr_) {
      return this.xhr_["responseBody"];
    }
  } catch (e) {
    goog.log.fine(this.logger_, "Can not get responseBody: " + e.message);
  }
  return null;
};
goog.net.XhrIo.prototype.getResponseXml = function() {
  try {
    return this.xhr_ ? this.xhr_.responseXML : null;
  } catch (e) {
    goog.log.fine(this.logger_, "Can not get responseXML: " + e.message);
    return null;
  }
};
goog.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  if (!this.xhr_) {
    return undefined;
  }
  var responseText = this.xhr_.responseText;
  if (opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) {
    responseText = responseText.substring(opt_xssiPrefix.length);
  }
  return goog.json.parse(responseText);
};
goog.net.XhrIo.prototype.getResponse = function() {
  try {
    if (!this.xhr_) {
      return null;
    }
    if ("response" in this.xhr_) {
      return this.xhr_.response;
    }
    switch(this.responseType_) {
      case goog.net.XhrIo.ResponseType.DEFAULT:
      ;
      case goog.net.XhrIo.ResponseType.TEXT:
        return this.xhr_.responseText;
      case goog.net.XhrIo.ResponseType.ARRAY_BUFFER:
        if ("mozResponseArrayBuffer" in this.xhr_) {
          return this.xhr_.mozResponseArrayBuffer;
        }
      ;
    }
    goog.log.error(this.logger_, "Response type " + this.responseType_ + " is not " + "supported on this browser");
    return null;
  } catch (e) {
    goog.log.fine(this.logger_, "Can not get response: " + e.message);
    return null;
  }
};
goog.net.XhrIo.prototype.getResponseHeader = function(key) {
  return this.xhr_ && this.isComplete() ? this.xhr_.getResponseHeader(key) : undefined;
};
goog.net.XhrIo.prototype.getAllResponseHeaders = function() {
  return this.xhr_ && this.isComplete() ? this.xhr_.getAllResponseHeaders() : "";
};
goog.net.XhrIo.prototype.getResponseHeaders = function() {
  var headersObject = {};
  var headersArray = this.getAllResponseHeaders().split("\r\n");
  for (var i = 0;i < headersArray.length;i++) {
    if (goog.string.isEmptyOrWhitespace(headersArray[i])) {
      continue;
    }
    var keyValue = goog.string.splitLimit(headersArray[i], ": ", 2);
    if (headersObject[keyValue[0]]) {
      headersObject[keyValue[0]] += ", " + keyValue[1];
    } else {
      headersObject[keyValue[0]] = keyValue[1];
    }
  }
  return headersObject;
};
goog.net.XhrIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};
goog.net.XhrIo.prototype.getLastError = function() {
  return goog.isString(this.lastError_) ? this.lastError_ : String(this.lastError_);
};
goog.net.XhrIo.prototype.formatMsg_ = function(msg) {
  return msg + " [" + this.lastMethod_ + " " + this.lastUri_ + " " + this.getStatus() + "]";
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = transformer(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
});
goog.provide("acgraph.vector.Ellipse");
goog.require("acgraph.math.Coordinate");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Shape");
acgraph.vector.Ellipse = function(opt_cx, opt_cy, opt_rx, opt_ry) {
  this.center_ = new acgraph.math.Coordinate(opt_cx || 0, opt_cy || 0);
  this.radiusX_ = opt_rx || 0;
  this.radiusY_ = opt_ry || 0;
  goog.base(this);
};
goog.inherits(acgraph.vector.Ellipse, acgraph.vector.Shape);
acgraph.vector.Ellipse.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.DATA;
acgraph.vector.Ellipse.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.ELLIPSE;
};
acgraph.vector.Ellipse.prototype.centerX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.center_.x != opt_value) {
      this.center_.x = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.center_.x;
};
acgraph.vector.Ellipse.prototype.centerY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.center_.y != opt_value) {
      this.center_.y = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.center_.y;
};
acgraph.vector.Ellipse.prototype.center = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!acgraph.math.Coordinate.equals(this.center_, opt_value)) {
      this.center_.x = opt_value.x;
      this.center_.y = opt_value.y;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.center_.clone();
};
acgraph.vector.Ellipse.prototype.radiusX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.radiusX_ != opt_value) {
      this.radiusX_ = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.radiusX_;
};
acgraph.vector.Ellipse.prototype.radiusY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.radiusY_ != opt_value) {
      this.radiusY_ = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.radiusY_;
};
acgraph.vector.Ellipse.prototype.setRadius = function(rx, ry) {
  this.radiusX(rx);
  this.radiusY(ry);
  return this;
};
acgraph.vector.Ellipse.prototype.getBoundsWithoutTransform = function() {
  return new acgraph.math.Rect(this.center_.x - this.radiusX_, this.center_.y - this.radiusY_, this.radiusX_ + this.radiusX_, this.radiusY_ + this.radiusY_);
};
acgraph.vector.Ellipse.prototype.getBoundsWithTransform = function(transform) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform) {
    return this.boundsCache.clone();
  } else {
    if (this.absoluteBoundsCache && isFullTransform) {
      return this.absoluteBoundsCache.clone();
    } else {
      var rect;
      if (transform) {
        var curves = acgraph.math.arcToBezier(this.center_.x, this.center_.y, this.radiusX_, this.radiusY_, 0, 360, true);
        transform.transform(curves, 0, curves, 0, curves.length / 2);
        rect = acgraph.math.calcCurveBounds.apply(null, curves);
      } else {
        rect = this.getBoundsWithoutTransform();
      }
      if (isSelfTransform) {
        this.boundsCache = rect.clone();
      }
      if (isFullTransform) {
        this.absoluteBoundsCache = rect.clone();
      }
      return rect;
    }
  }
};
acgraph.vector.Ellipse.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createEllipseElement();
};
acgraph.vector.Ellipse.prototype.renderInternal = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    this.renderData();
    if (this.fill() && this.fill()["src"]) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.FILL);
    }
  }
  goog.base(this, "renderInternal");
};
acgraph.vector.Ellipse.prototype.renderTransformation = function() {
  acgraph.getRenderer().setEllipseTransformation(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};
acgraph.vector.Ellipse.prototype.renderData = function() {
  acgraph.getRenderer().setEllipseProperties(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};
acgraph.vector.Ellipse.prototype.deserialize = function(data) {
  this.centerX(data["cx"]).centerY(data["cy"]);
  if ("rx" in data) {
    this.radiusX(data["rx"]);
  }
  if ("ry" in data) {
    this.radiusY(data["ry"]);
  }
  goog.base(this, "deserialize", data);
};
acgraph.vector.Ellipse.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  data["type"] = "ellipse";
  data["cx"] = this.centerX();
  data["cy"] = this.centerY();
  data["rx"] = this.radiusX();
  data["ry"] = this.radiusY();
  return data;
};
acgraph.vector.Ellipse.prototype.disposeInternal = function() {
  this.dropBoundsCache();
  this.center_ = null;
  goog.base(this, "disposeInternal");
};
goog.exportSymbol("acgraph.vector.Ellipse", acgraph.vector.Ellipse);
acgraph.vector.Ellipse.prototype["center"] = acgraph.vector.Ellipse.prototype.center;
acgraph.vector.Ellipse.prototype["centerX"] = acgraph.vector.Ellipse.prototype.centerX;
acgraph.vector.Ellipse.prototype["centerY"] = acgraph.vector.Ellipse.prototype.centerY;
acgraph.vector.Ellipse.prototype["radiusX"] = acgraph.vector.Ellipse.prototype.radiusX;
acgraph.vector.Ellipse.prototype["radiusY"] = acgraph.vector.Ellipse.prototype.radiusY;
acgraph.vector.Ellipse.prototype["setRadius"] = acgraph.vector.Ellipse.prototype.setRadius;
goog.provide("acgraph.vector.TextSegment");
goog.require("acgraph.utils.IdGenerator");
goog.require("goog.Disposable");
acgraph.vector.TextSegment = function(text, style) {
  goog.base(this);
  this.style_ = style || {};
  this.text = text;
  this.firstInLine = false;
  this.baseLine = 0;
  this.width = 0;
  this.height = 0;
  this.dx = 0;
  this.dy = 0;
  this.x = 0;
  this.y = 0;
};
goog.inherits(acgraph.vector.TextSegment, goog.Disposable);
acgraph.vector.TextSegment.prototype.domElement_ = null;
acgraph.vector.TextSegment.prototype.parent_ = null;
acgraph.vector.TextSegment.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.parent_ = opt_value;
    return this;
  } else {
    return this.parent_;
  }
};
acgraph.vector.TextSegment.prototype.domElement = function() {
  return this.domElement_;
};
acgraph.vector.TextSegment.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.TEXT_SEGMENT;
};
acgraph.vector.TextSegment.prototype.getStyle = function() {
  return this.style_;
};
acgraph.vector.TextSegment.prototype.setStyle = function(value) {
  this.style_ = value;
};
acgraph.vector.TextSegment.prototype.setTextSegmentPosition = function() {
  if (this.domElement_) {
    acgraph.getRenderer().setTextSegmentPosition(this);
  }
};
acgraph.vector.TextSegment.prototype.setTextSegmentProperties = function() {
  if (this.domElement_) {
    acgraph.getRenderer().setTextSegmentProperties(this);
  }
};
acgraph.vector.TextSegment.prototype.renderData = function() {
  if (this.text == "") {
    return;
  }
  this.domElement_ = acgraph.getRenderer().createTextSegmentElement();
  this.setTextSegmentProperties();
  goog.dom.appendChild(this.parent_.domElement(), this.domElement_);
};
acgraph.vector.TextSegment.prototype.disposeInternal = function() {
  acgraph.getRenderer().removeNode(this.domElement_);
  this.domElement_ = null;
  goog.base(this, "disposeInternal");
};
goog.provide("acgraph.utils.HTMLParser");
goog.require("goog.object");
acgraph.utils.HTMLParser = function() {
};
goog.addSingletonGetter(acgraph.utils.HTMLParser);
acgraph.utils.HTMLParser.State = {READ_TEXT:1, READ_TAG:2, READ_CLOSE_TAG:3, READ_ATTRIBUTES:4, ATTR_SPACE:5, EXPECTING_QUOTE:6, READ_EMPTY_QUOTES:7, EXPECTING_EMPTY_QUOTE:8, READ_QUOTES:9, READ_MISSING_QUOTES:10, READ_MISSING_EMPTY_QUOTES:11, READ_QUOTES_VALUE:12, READ_MISSING_QUOTES_VALUE:13, READ_ENTITY:14};
acgraph.utils.HTMLParser.NamedEntities = {"quot":34, "amp":38, "apos":39, "lt":60, "gt":62, "nbsp":160, "iexcl":161, "cent":162, "pound":163, "curren":164, "yen":165, "brvbar":166, "sect":167, "uml":168, "copy":169, "ordf":170, "laquo":171, "not":172, "shy":173, "reg":174, "macr":175, "deg":176, "plusmn":177, "sup2":178, "sup3":179, "acute":180, "micro":181, "para":182, "middot":183, "cedil":184, "sup1":185, "ordm":186, "raquo":187, "frac14":188, "frac12":189, "frac34":190, "iquest":191, "Agrave":192, 
"Aacute":193, "Acirc":194, "Atilde":195, "Auml":196, "Aring":197, "AElig":198, "Ccedil":199, "Egrave":200, "Eacute":201, "Ecirc":202, "Euml":203, "Igrave":204, "Iacute":205, "Icirc":206, "Iuml":207, "ETH":208, "Ntilde":209, "Ograve":210, "Oacute":211, "Ocirc":212, "Otilde":213, "Ouml":214, "times":215, "Oslash":216, "Ugrave":217, "Uacute":218, "Ucirc":219, "Uuml":220, "Yacute":221, "THORN":222, "szlig":223, "agrave":224, "aacute":225, "acirc":226, "atilde":227, "auml":228, "aring":229, "aelig":230, 
"ccedil":231, "egrave":232, "eacute":233, "ecirc":234, "euml":235, "igrave":236, "iacute":237, "icirc":238, "iuml":239, "eth":240, "ntilde":241, "ograve":242, "oacute":243, "ocirc":244, "otilde":245, "ouml":246, "divide":247, "oslash":248, "ugrave":249, "uacute":250, "ucirc":251, "uuml":252, "yacute":253, "thorn":254, "yuml":255, "OElig":338, "oelig":339, "Scaron":352, "scaron":353, "Yuml":376, "fnof":402, "circ":710, "tilde":732, "Alpha":913, "Beta":914, "Gamma":915, "Delta":916, "Epsilon":917, 
"Zeta":918, "Eta":919, "Theta":920, "Iota":921, "Kappa":922, "Lambda":923, "Mu":924, "Nu":925, "Xi":926, "Omicron":927, "Pi":928, "Rho":929, "Sigma":931, "Tau":932, "Upsilon":933, "Phi":934, "Chi":935, "Psi":936, "Omega":937, "alpha":945, "beta":946, "gamma":947, "delta":948, "epsilon":949, "zeta":950, "eta":951, "theta":952, "iota":953, "kappa":954, "lambda":955, "mu":956, "nu":957, "xi":958, "omicron":959, "pi":960, "rho":961, "sigmaf":962, "sigma":963, "tau":964, "upsilon":965, "phi":966, "chi":967, 
"psi":968, "omega":969, "thetasym":977, "upsih":978, "piv":982, "ensp":8194, "emsp":8195, "thinsp":8201, "zwnj":8204, "zwj":8205, "lrm":8206, "rlm":8207, "ndash":8211, "mdash":8212, "lsquo":8216, "rsquo":8217, "sbquo":8218, "ldquo":8220, "rdquo":8221, "bdquo":8222, "dagger":8224, "Dagger":8225, "bull":8226, "hellip":8230, "permil":8240, "prime":8242, "Prime":8243, "lsaquo":8249, "rsaquo":8250, "oline":8254, "frasl":8260, "euro":8364, "image":8465, "weierp":8472, "real":8476, "trade":8482, "alefsym":8501, 
"larr":8592, "uarr":8593, "rarr":8594, "darr":8595, "harr":8596, "crarr":8629, "lArr":8656, "uArr":8657, "rArr":8658, "dArr":8659, "hArr":8660, "forall":8704, "part":8706, "exist":8707, "empty":8709, "nabla":8711, "isin":8712, "notin":8713, "ni":8715, "prod":8719, "sum":8721, "minus":8722, "lowast":8727, "radic":8730, "prop":8733, "infin":8734, "ang":8736, "and":8743, "or":8744, "cap":8745, "cup":8746, "int":8747, "there4":8756, "sim":8764, "cong":8773, "asymp":8776, "ne":8800, "equiv":8801, "le":8804, 
"ge":8805, "sub":8834, "sup":8835, "nsub":8836, "sube":8838, "supe":8839, "oplus":8853, "otimes":8855, "perp":8869, "sdot":8901, "lceil":8968, "rceil":8969, "lfloor":8970, "rfloor":8971, "lang":9001, "rang":9002, "loz":9674, "spades":9824, "clubs":9827, "hearts":9829, "diams":9830};
acgraph.utils.HTMLParser.prototype.textElement = null;
acgraph.utils.HTMLParser.prototype.init_ = function() {
  this.styleStack = [];
  this.tagNameStack = [];
  this.tagName = "";
  this.closeTagName = "";
  this.attrName = "";
  this.quoteSymbol = "'";
  this.styleKey = "";
  this.styleValue = "";
  this.segmentText = "";
  this.style = null;
  this.textElement = null;
  this.state = acgraph.utils.HTMLParser.State.READ_TEXT;
  this.haveSpace = false;
  this.entity = "";
  this.isNamedEntity = true;
  this.ignoreSemicolon = false;
};
acgraph.utils.HTMLParser.prototype.prepareStyle_ = function() {
  if (!this.style) {
    this.style = (this.styleStack.length ? goog.object.clone(this.styleStack[this.styleStack.length - 1]) : {});
  }
};
acgraph.utils.HTMLParser.prototype.addTagStyleData_ = function(key) {
  switch(key) {
    case "b":
    ;
    case "strong":
      this.prepareStyle_();
      this.style.fontWeight = "bold";
      break;
    case "i":
    ;
    case "em":
      this.prepareStyle_();
      this.style.fontStyle = "italic";
      break;
  }
};
acgraph.utils.HTMLParser.prototype.addStyleData_ = function(key, opt_value) {
  switch(key) {
    case "font-style":
      this.prepareStyle_();
      this.style.fontStyle = (opt_value || "normal");
      break;
    case "font-variant":
      this.prepareStyle_();
      this.style.fontVariant = (opt_value || "normal");
      break;
    case "font-family":
      this.prepareStyle_();
      this.style.fontFamily = (opt_value || goog.global["acgraph"]["fontFamily"]);
      break;
    case "font-size":
      this.prepareStyle_();
      this.style.fontSize = (opt_value || goog.global["acgraph"]["fontSize"]);
      break;
    case "font-weight":
      this.prepareStyle_();
      this.style.fontWeight = (opt_value || "normal");
      break;
    case "color":
      this.prepareStyle_();
      this.style.color = (opt_value || goog.global["acgraph"]["color"]);
      break;
    case "letter-spacing":
      this.prepareStyle_();
      this.style.letterSpacing = (opt_value || "normal");
      break;
    case "text-decoration":
      this.prepareStyle_();
      this.style.decoration = (opt_value || "none");
      break;
    case "opacity":
      this.prepareStyle_();
      this.style.opacity = (goog.isDefAndNotNull(opt_value) ? parseFloat(opt_value) : 1);
      break;
  }
};
acgraph.utils.HTMLParser.prototype.doSegment_ = function() {
  if (this.segmentText != "") {
    var st = this.styleStack.length ? this.styleStack[this.styleStack.length - 1] : null;
    this.textElement.addSegment(this.segmentText, st);
    this.segmentText = "";
    this.haveSpace = false;
  }
};
acgraph.utils.HTMLParser.prototype.closeTag_ = function() {
  var tag = this.tagNameStack.length ? this.tagNameStack[this.tagNameStack.length - 1] : null;
  if (this.closeTagName == tag) {
    this.doSegment_();
    this.styleStack.pop();
    this.tagNameStack.pop();
    this.tagName = "";
  }
  this.closeTagName = "";
  this.state = acgraph.utils.HTMLParser.State.READ_TEXT;
};
acgraph.utils.HTMLParser.prototype.finalizeTagStyle_ = function(nextState, opt_resetAttrName) {
  this.addTagStyleData_(this.tagName);
  this.tagNameStack.push(this.tagName);
  this.styleStack.push(this.style);
  if (opt_resetAttrName) {
    this.attrName = "";
  }
  this.tagName = "";
  this.style = null;
  this.state = nextState;
};
acgraph.utils.HTMLParser.prototype.finalizeStyle_ = function(nextState, opt_resetAttrName) {
  this.addStyleData_(this.styleKey, this.styleValue || "");
  this.styleKey = "";
  this.styleValue = "";
  if (opt_resetAttrName) {
    this.attrName = "";
  }
  this.state = nextState;
};
acgraph.utils.HTMLParser.prototype.finalizeStyleAndTag_ = function(nextState) {
  this.addTagStyleData_(this.tagName);
  this.addStyleData_(this.styleKey, this.styleValue || "");
  this.tagNameStack.push(this.tagName);
  this.styleStack.push(this.style);
  this.tagName = "";
  this.style = null;
  this.attrName = "";
  this.styleKey = "";
  this.styleValue = "";
  this.state = nextState;
};
acgraph.utils.HTMLParser.prototype.finalizeEntity_ = function(nextState, lastSymbol) {
  var code;
  if (this.isNamedEntity) {
    var entityCode = acgraph.utils.HTMLParser.NamedEntities[this.entity];
    if (goog.isDef(entityCode)) {
      code = entityCode;
    } else {
      this.segmentText += "&" + this.entity + lastSymbol;
    }
  } else {
    if (this.entity) {
      code = parseInt(this.entity, 10);
    } else {
      this.segmentText += "&#" + lastSymbol;
    }
  }
  lastSymbol = lastSymbol == ";" ? "" : lastSymbol;
  if (code) {
    this.segmentText += String.fromCharCode(code) + lastSymbol;
  }
  this.state = nextState;
  this.entity = "";
  this.isNamedEntity = true;
};
acgraph.utils.HTMLParser.prototype.parseText = function(textElem) {
  this.init_();
  this.textElement = textElem;
  var text = textElem.text();
  var l = text.length, i = -1;
  var s = acgraph.utils.HTMLParser.State;
  var symbol;
  var isSpace = false;
  var isNotLetter = false;
  var ignoreUntilClose = false;
  while (++i < l) {
    symbol = text.charAt(i);
    isSpace = /\xa0|\s/.test(symbol);
    isNotLetter = /[^a-zA-Z]/.test(symbol);
    switch(this.state) {
      case s.READ_TEXT:
        if (symbol == "<") {
          this.state = s.READ_TAG;
          break;
        }
        if (this.haveSpace && isSpace) {
          break;
        }
        if (symbol == "&") {
          this.state = s.READ_ENTITY;
          break;
        }
        if (this.ignoreSemicolon) {
          this.ignoreSemicolon = false;
          if (symbol == ";") {
            break;
          }
        }
        this.segmentText += symbol;
        this.haveSpace = isSpace;
        break;
      case s.READ_ENTITY:
        if (this.isNamedEntity && !this.entity && symbol == "#") {
          this.isNamedEntity = false;
          break;
        }
        if (symbol == "&") {
          this.finalizeEntity_(s.READ_ENTITY, "");
          break;
        }
        var isNotLetterOrDigit = /(_|\W)/.test(symbol);
        if (isNotLetterOrDigit) {
          var nextState = symbol == "<" ? s.READ_TAG : s.READ_TEXT;
          this.finalizeEntity_(nextState, symbol);
          break;
        }
        var isDigit = /\d/.test(symbol);
        if (!this.isNamedEntity && !isDigit) {
          this.finalizeEntity_(s.READ_TEXT, symbol);
          break;
        }
        this.entity += symbol;
        if (acgraph.utils.HTMLParser.NamedEntities[this.entity]) {
          this.ignoreSemicolon = true;
          this.finalizeEntity_(s.READ_TEXT, "");
        }
        break;
      case s.READ_TAG:
        if (ignoreUntilClose) {
          if (symbol != ">") {
            break;
          }
          if (this.tagName == "br") {
            this.textElement.addBreak();
          }
          this.tagName = "";
          ignoreUntilClose = false;
          this.state = s.READ_TEXT;
          break;
        }
        if (!this.tagName && symbol == "<") {
          this.segmentText += "<";
          break;
        }
        if (!this.tagName && isNotLetter && symbol != "/") {
          this.segmentText += "<" + symbol;
          this.state = s.READ_TEXT;
          break;
        }
        if (!this.tagName && symbol == "/") {
          this.state = s.READ_CLOSE_TAG;
          break;
        }
        if (this.tagName == "br" && symbol == ">") {
          this.textElement.addBreak();
          this.tagName = "";
          this.state = s.READ_TEXT;
          break;
        }
        if (this.tagName == "br" && (symbol == "/" || isSpace)) {
          ignoreUntilClose = true;
          break;
        }
        if (this.tagName) {
          this.doSegment_();
        }
        if (!!this.tagName && isSpace) {
          this.state = s.READ_ATTRIBUTES;
          break;
        }
        if (symbol == ">") {
          this.finalizeTagStyle_(s.READ_TEXT);
          break;
        }
        this.tagName += symbol.toLowerCase();
        break;
      case s.READ_CLOSE_TAG:
        if (ignoreUntilClose) {
          if (symbol != ">") {
            break;
          }
          this.closeTag_();
          ignoreUntilClose = false;
          break;
        }
        if (!this.closeTagName && isNotLetter) {
          this.segmentText += "</" + symbol;
          this.state = s.READ_TEXT;
          break;
        }
        if (!!this.closeTagName && isSpace) {
          ignoreUntilClose = true;
          break;
        }
        if (symbol == ">") {
          this.closeTag_();
          ignoreUntilClose = false;
          break;
        }
        this.closeTagName += symbol.toLowerCase();
        break;
      case s.READ_ATTRIBUTES:
        if (ignoreUntilClose) {
          if (symbol != ">") {
            break;
          }
          this.finalizeTagStyle_(s.READ_TEXT, true);
          ignoreUntilClose = false;
          break;
        }
        if (symbol == ">") {
          this.finalizeTagStyle_(s.READ_TEXT, true);
          break;
        }
        if (isSpace) {
          this.state = s.ATTR_SPACE;
          break;
        }
        if (symbol == "=") {
          if (this.attrName) {
            this.state = this.attrName == "style" ? s.EXPECTING_QUOTE : s.EXPECTING_EMPTY_QUOTE;
          }
          break;
        }
        this.attrName += symbol.toLowerCase();
        break;
      case s.ATTR_SPACE:
        if (symbol == ">") {
          this.finalizeTagStyle_(s.READ_TEXT, true);
          break;
        }
        if (isSpace) {
          break;
        }
        if (!!this.attrName && !isNotLetter) {
          this.attrName = symbol;
          this.state = s.READ_ATTRIBUTES;
          break;
        }
        if (symbol == "=") {
          if (this.attrName) {
            this.state = this.attrName == "style" ? s.EXPECTING_QUOTE : s.EXPECTING_EMPTY_QUOTE;
          }
          break;
        }
        this.attrName += symbol;
        this.state = s.READ_ATTRIBUTES;
        break;
      case s.EXPECTING_QUOTE:
        if (isSpace) {
          break;
        }
        if (symbol == ">") {
          this.finalizeTagStyle_(s.READ_TEXT, true);
          break;
        }
        if (symbol == "'" || symbol == '"') {
          this.quoteSymbol = symbol;
          this.state = s.READ_QUOTES;
          break;
        }
        this.styleKey = symbol;
        this.state = s.READ_MISSING_QUOTES;
        break;
      case s.EXPECTING_EMPTY_QUOTE:
        if (isSpace) {
          break;
        }
        if (symbol == ">") {
          this.attrName = "";
          this.tagName = "";
          this.state = s.READ_TEXT;
          break;
        }
        if (symbol == "'" || symbol == '"') {
          this.quoteSymbol = symbol;
          this.state = s.READ_EMPTY_QUOTES;
          break;
        }
        this.state = s.READ_MISSING_EMPTY_QUOTES;
        break;
      case s.READ_QUOTES:
        if (isSpace) {
          break;
        }
        if (symbol == this.quoteSymbol) {
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }
        if (symbol == ":") {
          this.state = s.READ_QUOTES_VALUE;
          break;
        }
        this.styleKey += symbol.toLowerCase();
        break;
      case s.READ_QUOTES_VALUE:
        if (isSpace) {
          break;
        }
        if (symbol == this.quoteSymbol) {
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }
        if (symbol == ";") {
          this.finalizeStyle_(s.READ_QUOTES);
          break;
        }
        this.styleValue += symbol.toLowerCase();
        break;
      case s.READ_EMPTY_QUOTES:
        if (symbol == this.quoteSymbol) {
          this.attrName = "";
          this.state = s.READ_ATTRIBUTES;
          break;
        }
        break;
      case s.READ_MISSING_QUOTES:
        if (isSpace) {
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }
        if (symbol == ">") {
          this.finalizeStyleAndTag_(s.READ_TEXT);
          break;
        }
        if (symbol == ":") {
          this.state = s.READ_MISSING_QUOTES_VALUE;
          break;
        }
        this.styleKey += symbol;
        break;
      case s.READ_MISSING_EMPTY_QUOTES:
        if (isSpace) {
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }
        if (symbol == ">") {
          this.finalizeTagStyle_(s.READ_TEXT);
          break;
        }
        break;
      case s.READ_MISSING_QUOTES_VALUE:
        if (isSpace) {
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }
        if (symbol == ">") {
          this.finalizeStyleAndTag_(s.READ_TEXT);
          break;
        }
        if (symbol == ";") {
          this.finalizeStyle_(s.READ_MISSING_QUOTES);
          break;
        }
        this.styleValue += symbol.toLowerCase();
        break;
      default:
        throw "Error while parsing HTML: Symbol '" + symbol + "', position: " + (i - 1);;
    }
  }
  this.doSegment_();
  this.textElement.finalizeTextLine();
};
goog.provide("acgraph.vector.Text");
goog.provide("acgraph.vector.Text.TextOverflow");
goog.provide("acgraph.vector.Text.TextWrap");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.HTMLParser");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Element");
goog.require("acgraph.vector.TextSegment");
acgraph.vector.Text = function(opt_x, opt_y) {
  this.defragmented = false;
  this.x_ = opt_x || 0;
  this.y_ = opt_y || 0;
  this.bounds = new acgraph.math.Rect(this.x_, this.y_, 0, 0);
  this.realHeigth = 0;
  this.realWidth = 0;
  this.calcX = 0;
  this.calcY = 0;
  this.htmlOn_ = false;
  this.segments_ = [];
  this.currentLine_ = [];
  this.currentLineWidth_ = 0;
  this.prevLineWidth_ = 0;
  this.currentLineHeight_ = 0;
  this.currentLineEmpty_ = true;
  this.currentNumberSeqBreaks_ = 0;
  this.accumulatedHeight_ = 0;
  this.currentBaseLine_ = 0;
  this.currentDy_ = 0;
  this.textLines_ = [];
  this.lineHeight_ = 1;
  this.ellipsis_ = acgraph.vector.Text.TextOverflow.CLIP;
  this.textIndent_ = 0;
  this.rtl = false;
  this.stopAddSegments_ = false;
  this.defaultStyle_ = ({"fontSize":goog.global["acgraph"]["fontSize"], "color":goog.global["acgraph"]["fontColor"], "fontFamily":goog.global["acgraph"]["fontFamily"], "direction":goog.global["acgraph"]["textDirection"], "textOverflow":acgraph.vector.Text.TextOverflow.CLIP, "textWrap":acgraph.vector.Text.TextWrap.NO_WRAP, "selectable":true, "hAlign":acgraph.vector.Text.HAlign.START});
  this.style_ = (this.defaultStyle_);
  goog.base(this);
};
goog.inherits(acgraph.vector.Text, acgraph.vector.Element);
acgraph.vector.Text.TextWrap = {NO_WRAP:"noWrap", BY_LETTER:"byLetter"};
acgraph.vector.Text.TextOverflow = {CLIP:"", ELLIPSIS:"..."};
acgraph.vector.Text.HAlign = {LEFT:"left", START:"start", CENTER:"center", END:"end", RIGHT:"right"};
acgraph.vector.Text.VAlign = {TOP:"top", MIDDLE:"middle", BOTTOM:"bottom"};
acgraph.vector.Text.Decoration = {BLINK:"blink", LINE_THROUGH:"line-through", OVERLINE:"overline", UNDERLINE:"underline", NONE:"none"};
acgraph.vector.Text.FontVariant = {NORMAL:"normal", SMALL_CAP:"small-caps"};
acgraph.vector.Text.FontStyle = {NORMAL:"normal", ITALIC:"italic", OBLIQUE:"oblique"};
acgraph.vector.Text.Direction = {LTR:"ltr", RTL:"rtl"};
acgraph.vector.Text.prototype.SUPPORTED_DIRTY_STATES = acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES | acgraph.vector.Element.DirtyState.DATA | acgraph.vector.Element.DirtyState.STYLE | acgraph.vector.Element.DirtyState.POSITION;
acgraph.vector.Text.prototype.style_ = null;
acgraph.vector.Text.prototype.text_ = null;
acgraph.vector.Text.prototype.x = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.x_ != opt_value) {
      this.x_ = opt_value;
      if (this.defragmented) {
        this.calculateX();
      }
      this.bounds.left = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.x_;
};
acgraph.vector.Text.prototype.y = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.y_ != opt_value) {
      this.y_ = opt_value;
      if (this.defragmented) {
        this.calculateY();
      }
      this.bounds.top = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.y_;
};
acgraph.vector.Text.prototype.setStyleProperty = function(prop, opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value !== this.style_[prop]) {
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) {
        this.getStage().suspend();
      }
      this.style_[prop] = opt_value;
      this.defragmented = false;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.transformAfterChange();
      if (!stageSuspended) {
        this.getStage().resume();
      }
    }
    return this;
  }
  return (this.style_[prop]);
};
acgraph.vector.Text.prototype.transformAfterChange = function() {
  if (acgraph.getRenderer().needsReRenderOnParentTransformationChange()) {
    var tx = this.getFullTransformation();
    if (tx && !tx.isIdentity()) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    }
  }
};
acgraph.vector.Text.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.setStyleProperty("width") != opt_value) {
      this.width_ = opt_value = Math.max(opt_value, 0) || 0;
    }
  }
  return (this.setStyleProperty("width", opt_value));
};
acgraph.vector.Text.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.setStyleProperty("height") != opt_value) {
      this.height_ = opt_value = Math.max(opt_value, 0) || 0;
    }
  }
  return (this.setStyleProperty("height", opt_value));
};
acgraph.vector.Text.prototype.opacity = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.style_["opacity"] = opt_value;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    return this;
  }
  return this.style_["opacity"];
};
acgraph.vector.Text.prototype.color = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.style_["color"] = opt_value;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    return this;
  }
  return this.style_["color"];
};
acgraph.vector.Text.prototype.fontSize = function(opt_value) {
  return (this.setStyleProperty("fontSize", opt_value));
};
acgraph.vector.Text.prototype.fontFamily = function(opt_value) {
  return (this.setStyleProperty("fontFamily", opt_value));
};
acgraph.vector.Text.prototype.direction = function(opt_value) {
  return (this.setStyleProperty("direction", (opt_value)));
};
acgraph.vector.Text.prototype.fontStyle = function(opt_value) {
  return (this.setStyleProperty("fontStyle", (opt_value)));
};
acgraph.vector.Text.prototype.fontVariant = function(opt_value) {
  return (this.setStyleProperty("fontVariant", (opt_value)));
};
acgraph.vector.Text.prototype.fontWeight = function(opt_value) {
  return (this.setStyleProperty("fontWeight", opt_value));
};
acgraph.vector.Text.prototype.letterSpacing = function(opt_value) {
  return (this.setStyleProperty("letterSpacing", opt_value));
};
acgraph.vector.Text.prototype.decoration = function(opt_value) {
  return (this.setStyleProperty("decoration", (opt_value)));
};
acgraph.vector.Text.prototype.lineHeight = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.lineHeight_ = this.normalizeLineHeight_(opt_value);
  }
  return (this.setStyleProperty("lineHeight", opt_value));
};
acgraph.vector.Text.prototype.normalizeLineHeight_ = function(lineHeight) {
  var value = parseFloat(lineHeight);
  if (isNaN(value) || value < 0) {
    return 1;
  } else {
    if (goog.isString(lineHeight) && goog.string.endsWith(lineHeight, "%")) {
      return 1 + parseFloat(lineHeight) / 100;
    }
  }
  return (lineHeight);
};
acgraph.vector.Text.prototype.textIndent = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.textIndent_ = opt_value;
  }
  return (this.setStyleProperty("textIndent", opt_value));
};
acgraph.vector.Text.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == "center") {
      opt_value = acgraph.vector.Text.VAlign.MIDDLE;
    } else {
      var validParam = false;
      goog.object.forEach(acgraph.vector.Text.VAlign, function(value) {
        if (opt_value == value) {
          validParam = true;
        }
      });
      if (!validParam) {
        opt_value = acgraph.vector.Text.VAlign.TOP;
      }
    }
  }
  return (this.setStyleProperty("vAlign", (opt_value)));
};
acgraph.vector.Text.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == "middle") {
      opt_value = acgraph.vector.Text.HAlign.CENTER;
    } else {
      var validParam = false;
      goog.object.forEach(acgraph.vector.Text.HAlign, function(value) {
        if (opt_value == value) {
          validParam = true;
        }
      });
      if (!validParam) {
        opt_value = acgraph.vector.Text.HAlign.START;
      }
    }
  }
  return (this.setStyleProperty("hAlign", (opt_value)));
};
acgraph.vector.Text.prototype.textWrap = function(opt_value) {
  return (this.setStyleProperty("textWrap", (opt_value)));
};
acgraph.vector.Text.prototype.textOverflow = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.ellipsis_ = opt_value;
  }
  return (this.setStyleProperty("textOverflow", (opt_value)));
};
acgraph.vector.Text.prototype.selectable = function(opt_value) {
  return (this.setStyleProperty("selectable", opt_value));
};
acgraph.vector.Text.prototype.style = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value) {
      goog.object.extend(this.style_, opt_value);
    }
    this.width_ = parseFloat(this.style_["width"]) || 0;
    this.height_ = parseFloat(this.style_["height"]) || 0;
    if (this.style_["lineHeight"]) {
      this.lineHeight_ = this.normalizeLineHeight_(this.style_["lineHeight"]);
    }
    var validParam;
    var vAlign = this.style_["vAlign"];
    if (goog.isDefAndNotNull(vAlign)) {
      if (vAlign == "center") {
        this.style_["vAlign"] = acgraph.vector.Text.VAlign.MIDDLE;
      } else {
        validParam = false;
        goog.object.forEach(acgraph.vector.Text.VAlign, function(value) {
          if (vAlign == value) {
            validParam = true;
          }
        });
        if (!validParam) {
          this.style_["vAlign"] = acgraph.vector.Text.VAlign.TOP;
        }
      }
    }
    var hAlign = this.style_["hAlign"];
    if (goog.isDefAndNotNull(hAlign)) {
      if (hAlign == "middle") {
        this.style_["hAlign"] = acgraph.vector.Text.HAlign.CENTER;
      } else {
        validParam = false;
        goog.object.forEach(acgraph.vector.Text.HAlign, function(value) {
          if (hAlign == value) {
            validParam = true;
          }
        });
        if (!validParam) {
          this.style_["hAlign"] = acgraph.vector.Text.HAlign.START;
        }
      }
    }
    if (goog.isDefAndNotNull(this.style_["direction"])) {
      this.rtl = this.style_["direction"] == acgraph.vector.Text.Direction.RTL;
    }
    if (goog.isDefAndNotNull(this.style_["textOverflow"])) {
      this.ellipsis_ = this.style_["textOverflow"];
    }
    if (goog.isDefAndNotNull(this.style_["textIndent"])) {
      this.textIndent_ = this.style_["textIndent"];
    }
    if (this.rtl) {
      this.textIndent_ = 0;
    }
    var stageSuspended = !this.getStage() || this.getStage().isSuspended();
    if (!stageSuspended) {
      this.getStage().suspend();
    }
    this.defragmented = false;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.transformAfterChange();
    if (!stageSuspended) {
      this.getStage().resume();
    }
    return this;
  }
  return this.style_;
};
acgraph.vector.Text.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.text_) {
      this.text_ = String(opt_value);
      this.htmlOn_ = false;
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) {
        this.getStage().suspend();
      }
      this.defragmented = false;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.transformAfterChange();
      if (!stageSuspended) {
        this.getStage().resume();
      }
    }
    return this;
  }
  return this.text_;
};
acgraph.vector.Text.prototype.htmlText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.text_) {
      this.text_ = String(opt_value);
      this.htmlOn_ = true;
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) {
        this.getStage().suspend();
      }
      this.defragmented = false;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.transformAfterChange();
      if (!stageSuspended) {
        this.getStage().resume();
      }
    }
    return this;
  }
  return this.text_;
};
acgraph.vector.Text.prototype.init_ = function() {
  if (this.segments_.length != 0) {
    this.textLines_ = [];
    this.segments_ = [];
  }
  if (goog.isDefAndNotNull(this.style_["direction"])) {
    this.rtl = this.style_["direction"] == acgraph.vector.Text.Direction.RTL;
  }
  if (goog.isDefAndNotNull(this.style_["textIndent"])) {
    this.textIndent_ = this.style_["textIndent"];
  }
  if (this.rtl) {
    this.textIndent_ = 0;
  }
  this.width_ = parseFloat(this.style_["width"]) || 0;
  this.height_ = parseFloat(this.style_["height"]) || 0;
  this.stopAddSegments_ = false;
  this.prevLineWidth_ = 0;
  this.currentDy_ = 0;
  this.realWidth = 0;
  this.realHeigth = 0;
  this.accumulatedHeight_ = 0;
  this.currentNumberSeqBreaks_ = 0;
  this.currentLineHeight_ = 0;
  this.currentLineWidth_ = 0;
  this.currentBaseLine_ = 0;
  this.currentLine_ = [];
  this.calcX = 0;
  this.calcY = 0;
};
acgraph.vector.Text.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.TEXT;
};
acgraph.vector.Text.prototype.getSegments = function() {
  return this.segments_;
};
acgraph.vector.Text.prototype.getLines = function() {
  return this.textLines_;
};
acgraph.vector.Text.prototype.getBoundsWithoutTransform = function() {
  return this.bounds.clone();
};
acgraph.vector.Text.prototype.getBoundsWithTransform = function(transform) {
  if (!this.defragmented) {
    this.textDefragmentation();
  }
  if (!transform) {
    return this.bounds.clone();
  }
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform) {
    return this.boundsCache.clone();
  } else {
    if (this.absoluteBoundsCache && isFullTransform) {
      return this.absoluteBoundsCache.clone();
    } else {
      var rect = acgraph.math.getBoundsOfRectWithTransform(this.bounds.clone(), transform);
      if (isSelfTransform) {
        this.boundsCache = rect.clone();
      }
      if (isFullTransform) {
        this.absoluteBoundsCache = rect.clone();
      }
      return rect;
    }
  }
};
acgraph.vector.Text.prototype.getOriginalBounds = function() {
  if (goog.isDefAndNotNull(this.text_)) {
    var measure = (acgraph.getRenderer().measure(this.text(), this.style()));
    measure.left = this.x_;
    measure.top = this.y_;
    return measure;
  }
  return new acgraph.math.Rect(0, 0, 0, 0);
};
acgraph.vector.Text.prototype.isHtml = function() {
  return this.htmlOn_;
};
acgraph.vector.Text.prototype.mergeStyles_ = function(var_args) {
  var settingsAffectingSize = acgraph.getRenderer().settingsAffectingSize;
  var styles = arguments;
  var style = {};
  for (var j = 0, l = settingsAffectingSize.length;j < l;j++) {
    for (var i = styles.length;i--;) {
      var s = styles[i];
      if (s) {
        var prop = s[settingsAffectingSize[j]];
        if (goog.isDef(prop)) {
          style[settingsAffectingSize[j]] = prop;
          break;
        }
      }
    }
  }
  return style;
};
acgraph.vector.Text.prototype.getTextBounds = function(text, segmentStyle) {
  var style = this.mergeStyles_(this.style_, segmentStyle);
  return acgraph.getRenderer().textBounds(text, style);
};
acgraph.vector.Text.prototype.cutTextSegment_ = function(text, style, a, b, segmentBounds) {
  var subWrappedText;
  var subSegmentBounds;
  var width = b - a;
  var avgSymbolWeight = segmentBounds.width / text.length;
  var pos = Math.floor(width / avgSymbolWeight);
  subWrappedText = text.substring(0, pos);
  subSegmentBounds = this.getTextBounds(subWrappedText, style);
  while (a + subSegmentBounds.width < b && pos > 1) {
    pos++;
    subWrappedText = text.substring(0, pos);
    subSegmentBounds = this.getTextBounds(subWrappedText, style);
  }
  while (a + subSegmentBounds.width > b && pos > 1) {
    pos--;
    subWrappedText = text.substring(0, pos);
    subSegmentBounds = this.getTextBounds(subWrappedText, style);
  }
  var resultStatus = this.mergeStyles_(this.style_, style);
  var cutText = text.substring(pos, text.length);
  var cutTextWidth = segmentBounds.width - subSegmentBounds.width;
  var bounds = segmentBounds.clone();
  bounds.width = cutTextWidth;
  acgraph.getRenderer().textBounds(cutText, resultStatus, bounds);
  return pos;
};
acgraph.vector.Text.prototype.createSegment_ = function(text, style, bounds, opt_shift) {
  var segment = new acgraph.vector.TextSegment(text, style);
  segment.baseLine = -bounds.top;
  segment.height = bounds.height;
  segment.width = bounds.width;
  if (this.textIndent_ && this.segments_.length == 0) {
    var shift = opt_shift || 0;
    this.textIndent_ = this.width_ && this.textIndent_ + bounds.width + shift > this.width_ ? this.width_ - bounds.width - shift : this.textIndent_;
    if (this.textIndent_ < 0) {
      this.textIndent_ = 0;
    }
  }
  this.currentLineHeight_ = Math.max(this.currentLineHeight_, bounds.height);
  this.currentLineWidth_ += bounds.width;
  if (this.segments_.length == 0) {
    this.currentLineWidth_ += this.textIndent_;
  }
  this.currentBaseLine_ = Math.max(this.currentBaseLine_, segment.baseLine);
  this.currentLineEmpty_ = this.currentLine_.length ? this.currentLineEmpty_ && text.length == 0 : text.length == 0;
  this.currentLine_.push(segment);
  this.segments_.push(segment);
  segment.parent(this);
  return segment;
};
acgraph.vector.Text.prototype.applyTextOverflow_ = function() {
  var segment, index, cutPos, textSegmentEllipsis;
  var line = (goog.array.peek(this.textLines_));
  var peekSegment = (goog.array.peek(line));
  var ellipsisBounds = this.getTextBounds(this.ellipsis_, peekSegment.getStyle());
  var ellipsis = this.ellipsis_;
  if (ellipsisBounds.width > this.width_) {
    cutPos = this.cutTextSegment_(this.ellipsis_, peekSegment.getStyle(), 0, this.width_, ellipsisBounds);
    ellipsis = this.ellipsis_.substring(0, cutPos);
  }
  var left = this.prevLineWidth_;
  var right = this.width_;
  if (ellipsis == "") {
    index = goog.array.indexOf(this.segments_, peekSegment) + 1;
    goog.array.splice(this.segments_, index, this.segments_.length - index);
  } else {
    if (right - left >= ellipsisBounds.width) {
      this.currentLine_ = line;
      index = goog.array.indexOf(this.segments_, peekSegment) + 1;
      goog.array.splice(this.segments_, index, this.segments_.length - index);
      textSegmentEllipsis = this.createSegment_(ellipsis, peekSegment.getStyle(), ellipsisBounds);
      if (this.currentLine_.length == 2 && this.currentLine_[0].text == "") {
        textSegmentEllipsis.dy = this.accumulatedHeight_ - this.currentLine_[0].height;
        textSegmentEllipsis.firstInLine = true;
      }
    } else {
      var i = line.length - 1;
      var segmentBounds;
      while (!segment && i >= 0) {
        peekSegment = line[i];
        ellipsisBounds = this.getTextBounds(ellipsis, peekSegment.getStyle());
        segmentBounds = this.getTextBounds(peekSegment.text, peekSegment.getStyle());
        if (left - segmentBounds.width + ellipsisBounds.width <= this.width_) {
          segment = peekSegment;
        }
        left -= segmentBounds.width;
        i--;
      }
      if (!segment && this.textLines_.length == 1) {
        segment = line[0];
        left -= segmentBounds.width;
      }
      if (segment) {
        this.currentLine_ = line;
        var dy = this.currentLine_[0].dy;
        right -= ellipsisBounds.width;
        index = goog.array.indexOf(line, segment);
        goog.array.splice(line, index, line.length - index);
        index = goog.array.indexOf(this.segments_, segment);
        goog.array.splice(this.segments_, index, this.segments_.length - index);
        this.currentLineHeight_ = 0;
        this.currentLineWidth_ = 0;
        this.currentBaseLine_ = 0;
        segmentBounds = this.getTextBounds(segment.text, segment.getStyle());
        cutPos = this.cutTextSegment_(segment.text, segment.getStyle(), left, right, segmentBounds);
        if (cutPos < 1) {
          cutPos = 1;
        }
        var cutText = segment.text.substring(0, cutPos);
        var segment_bounds = this.getTextBounds(cutText, segment.getStyle());
        var lastSegmentInline = this.createSegment_(cutText, segment.getStyle(), segment_bounds, ellipsisBounds.width);
        lastSegmentInline.x = segment.x;
        lastSegmentInline.y = segment.y;
        if (segment_bounds.width + ellipsisBounds.width > this.width_) {
          cutPos = this.cutTextSegment_(this.ellipsis_, peekSegment.getStyle(), segment_bounds.width, this.width_, ellipsisBounds);
          ellipsis = this.ellipsis_.substring(0, cutPos);
        }
        if (cutPos > 0) {
          textSegmentEllipsis = this.createSegment_(ellipsis, segment.getStyle(), ellipsisBounds);
          textSegmentEllipsis.x = lastSegmentInline.x + segment_bounds.width;
          textSegmentEllipsis.y = lastSegmentInline.y;
        }
        this.currentLine_[0].firstInLine = true;
        this.currentLine_[0].dy = dy;
      }
    }
  }
  if (this.rtl && textSegmentEllipsis) {
    var firstLineSegment = this.currentLine_[0];
    textSegmentEllipsis.firstInLine = firstLineSegment.firstInLine;
    textSegmentEllipsis.x = firstLineSegment.x;
    textSegmentEllipsis.dy = firstLineSegment.dy;
    firstLineSegment.dy = 0;
    firstLineSegment.x = 0;
    firstLineSegment.firstInLine = false;
    goog.array.remove(this.segments_, textSegmentEllipsis);
    index = goog.array.indexOf(this.segments_, firstLineSegment);
    goog.array.insertAt(this.segments_, textSegmentEllipsis, index);
  }
  this.stopAddSegments_ = true;
};
acgraph.vector.Text.prototype.addBreak = function() {
  if (this.currentLineEmpty_) {
    this.addSegment("");
  }
  this.finalizeTextLine();
  this.currentNumberSeqBreaks_++;
  this.addSegment("");
  var height = this.currentLine_[0] ? this.currentLine_[0].height : 0;
  this.accumulatedHeight_ += goog.isString(this.lineHeight_) ? parseInt(this.lineHeight_, 0) + height : this.lineHeight_ * height;
};
acgraph.vector.Text.prototype.addSegment = function(text, opt_style) {
  if (this.stopAddSegments_) {
    return;
  }
  var style = opt_style || {};
  var segment_bounds = this.getTextBounds(text, style);
  var shift = this.segments_.length == 0 ? this.textIndent_ : 0;
  if (this.style_["width"]) {
    while (this.currentLineWidth_ + segment_bounds.width + shift > this.width_ && !this.stopAddSegments_) {
      var cutPos = this.cutTextSegment_(text, style, shift + this.currentLineWidth_, this.width_, segment_bounds);
      if (cutPos < 1 && this.currentLine_.length == 0) {
        cutPos = 1;
      }
      if (cutPos != 0) {
        var cutText = goog.string.trimRight(text.substring(0, cutPos));
        segment_bounds = this.getTextBounds(cutText, style);
        this.createSegment_(cutText, style, segment_bounds);
      }
      this.finalizeTextLine();
      if (text.length == 1) {
        this.stopAddSegments_ = true;
      }
      shift = 0;
      if (this.style_["textWrap"] == acgraph.vector.Text.TextWrap.BY_LETTER) {
        text = goog.string.trimLeft(text.substring(cutPos, text.length));
        segment_bounds = this.getTextBounds(text, style);
      } else {
        if (this.htmlOn_) {
          text = "";
          segment_bounds = this.getTextBounds(text, style);
        } else {
          this.stopAddSegments_ = true;
        }
      }
    }
  }
  if (!this.stopAddSegments_) {
    this.createSegment_(text, style, segment_bounds);
  }
};
acgraph.vector.Text.prototype.finalizeTextLine = function() {
  if (this.textWrap() == acgraph.vector.Text.TextWrap.NO_WRAP && this.textLines_.length == 1 && !this.htmlOn_) {
    this.applyTextOverflow_();
  }
  if (this.stopAddSegments_ || this.currentLine_.length == 0) {
    return;
  }
  var firstLine = this.textLines_.length == 0;
  var endOfText = this.height_ && this.realHeigth + this.currentLineHeight_ > this.height_ && this.textLines_.length != 0;
  if (endOfText) {
    this.applyTextOverflow_();
  } else {
    this.currentLineHeight_ = goog.isString(this.lineHeight_) ? parseInt(this.lineHeight_, 0) + this.currentLineHeight_ : this.lineHeight_ * this.currentLineHeight_;
    if (acgraph.getRenderer().needsAnotherBehaviourForCalcText()) {
      var shift, i, len, segment;
      var startPosition = this.rtl && this.style_["hAlign"] == acgraph.vector.Text.HAlign.END || !this.rtl && this.style_["hAlign"] == acgraph.vector.Text.HAlign.START || this.style_["hAlign"] == acgraph.vector.Text.HAlign.LEFT;
      var endPosition = this.rtl && this.style_["hAlign"] == acgraph.vector.Text.HAlign.START || !this.rtl && this.style_["hAlign"] == acgraph.vector.Text.HAlign.END || this.style_["hAlign"] == acgraph.vector.Text.HAlign.RIGHT;
      var middlePosition = this.style_["hAlign"] == acgraph.vector.Text.HAlign.CENTER;
      if (startPosition) {
        if (this.rtl) {
          shift = 0;
        } else {
          shift = this.textIndent_ && firstLine ? this.textIndent_ : 0;
        }
        for (i = 0, len = this.currentLine_.length;i < len;i++) {
          segment = this.currentLine_[i];
          segment.x = shift;
          segment.y = this.realHeigth + this.currentBaseLine_ + segment.height - segment.baseLine * 1.5;
          shift += segment.width;
        }
      } else {
        if (middlePosition) {
          shift = -this.currentLineWidth_ / 2;
          if (!this.rtl && this.textIndent_ && firstLine) {
            shift += this.textIndent_;
          } else {
            if (this.rtl && this.textIndent_ && firstLine) {
              shift -= 0;
            }
          }
          for (i = 0, len = this.currentLine_.length;i < len;i++) {
            segment = this.currentLine_[i];
            segment.x = shift + segment.width / 2;
            segment.y = this.realHeigth + this.currentBaseLine_ + segment.height - segment.baseLine * 1.5;
            shift += segment.width;
          }
        } else {
          if (endPosition) {
            if (this.rtl) {
              shift = this.textIndent_ && firstLine ? -this.textIndent_ : 0;
            } else {
              shift = 0;
            }
            for (i = this.currentLine_.length - 1;i >= 0;i--) {
              segment = this.currentLine_[i];
              segment.x = shift;
              segment.y = this.realHeigth + this.currentBaseLine_ + segment.height - segment.baseLine * 1.5;
              shift -= segment.width;
            }
          }
        }
      }
    }
    if (!firstLine) {
      var firstSegment;
      for (var i = 0;i < this.currentLine_.length;i++) {
        if (this.currentLine_[i].text != "") {
          firstSegment = this.currentLine_[i];
          break;
        }
      }
      if (firstSegment) {
        firstSegment.firstInLine = true;
        if (!this.currentLineEmpty_) {
          if (this.accumulatedHeight_ && this.currentNumberSeqBreaks_ > 1) {
            firstSegment.dy = this.accumulatedHeight_;
          } else {
            firstSegment.dy = this.currentDy_ + this.currentBaseLine_;
          }
        }
      }
    } else {
      this.currentLine_[0].baseLine = this.currentBaseLine_;
      if (this.textIndent_ && this.style_["hAlign"] == acgraph.vector.Text.HAlign.CENTER) {
        this.currentLine_[0].dx = this.rtl ? -this.textIndent_ / 2 : this.textIndent_ / 2;
      }
    }
    this.realHeigth += this.currentLineHeight_;
    this.realWidth = Math.max(this.realWidth, this.currentLineWidth_);
    this.currentDy_ = this.currentLineHeight_ - this.currentBaseLine_;
    this.prevLineWidth_ = this.currentLineWidth_;
    if (!this.currentLineEmpty_) {
      this.accumulatedHeight_ = 0;
      this.currentNumberSeqBreaks_ = 0;
    }
    this.currentLineEmpty_ = true;
    this.currentLineHeight_ = 0;
    this.currentLineWidth_ = 0;
    this.currentBaseLine_ = 0;
    this.textLines_.push(this.currentLine_);
    this.currentLine_ = [];
  }
};
acgraph.vector.Text.prototype.calculateX = function() {
  this.calcX = this.x_;
  if (this.style_["hAlign"] == acgraph.vector.Text.HAlign.START) {
    this.calcX += this.rtl ? this.width_ : 0;
  } else {
    if (this.style_["hAlign"] == acgraph.vector.Text.HAlign.CENTER) {
      this.calcX += this.width_ / 2;
    } else {
      if (this.style_["hAlign"] == acgraph.vector.Text.HAlign.END) {
        this.calcX += this.rtl ? 0 : this.width_;
      } else {
        if (this.style_["hAlign"] == acgraph.vector.Text.HAlign.RIGHT) {
          this.calcX += this.width_;
        }
      }
    }
  }
};
acgraph.vector.Text.prototype.calculateY = function() {
  this.calcY = this.y_ + (this.segments_.length == 0 ? 0 : this.segments_[0].baseLine);
  if (this.style_["vAlign"] && this.realHeigth < this.style_["height"]) {
    if (this.style_["vAlign"] == acgraph.vector.Text.VAlign.MIDDLE) {
      this.calcY += this.height_ / 2 - this.realHeigth / 2;
    } else {
      if (this.style_["vAlign"] == acgraph.vector.Text.VAlign.BOTTOM) {
        this.calcY += this.height_ - this.realHeigth;
      }
    }
  }
};
acgraph.vector.Text.prototype.textDefragmentation = function() {
  this.init_();
  var text, i;
  if (this.text_ == null) {
    return;
  }
  if (this.htmlOn_) {
    acgraph.utils.HTMLParser.getInstance().parseText(this);
  } else {
    var q = /\n/g;
    this.text_ = goog.string.canonicalizeNewlines(goog.string.normalizeSpaces(this.text_));
    var textArr = this.text_.split(q);
    for (i = 0;i < textArr.length;i++) {
      text = textArr[i];
      if (goog.isDefAndNotNull(text)) {
        if (text == "") {
          this.addBreak();
        } else {
          this.addSegment(text);
          this.addBreak();
        }
      }
    }
  }
  if (this.textIndent_ && this.textLines_.length > 0) {
    var line = this.textLines_[0];
    var segment = line[0];
    if (this.rtl) {
      if (!this.style_["hAlign"] || this.style_["hAlign"] == acgraph.vector.Text.HAlign.START || this.style_["hAlign"] == acgraph.vector.Text.HAlign.RIGHT) {
        segment.dx -= this.textIndent_;
      }
    } else {
      if (!this.style_["hAlign"] || this.style_["hAlign"] == acgraph.vector.Text.HAlign.START || this.style_["hAlign"] == acgraph.vector.Text.HAlign.LEFT) {
        segment.dx += this.textIndent_;
      }
    }
  }
  if (!this.style_["width"]) {
    this.width_ = this.realWidth;
  }
  if (!this.style_["height"]) {
    this.height_ = this.realHeigth;
  }
  this.calculateX();
  this.calculateY();
  this.bounds = new acgraph.math.Rect(this.x_, this.y_, this.width_, this.height_);
  this.defragmented = true;
};
acgraph.vector.Text.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createTextElement();
};
acgraph.vector.Text.prototype.renderInternal = function() {
  if (!this.defragmented) {
    this.textDefragmentation();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.STYLE)) {
    this.renderStyle();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    this.renderData();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.POSITION)) {
    this.renderPosition();
  }
  goog.base(this, "renderInternal");
};
acgraph.vector.Text.prototype.renderPosition = function() {
  for (var i = 0, len = this.segments_.length;i < len;i++) {
    this.segments_[i].setTextSegmentPosition();
  }
  acgraph.getRenderer().setTextPosition(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.POSITION);
};
acgraph.vector.Text.prototype.renderStyle = function() {
  acgraph.getRenderer().setTextProperties(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.STYLE);
};
acgraph.vector.Text.prototype.renderData = function() {
  if (this.domElement()) {
    goog.dom.removeChildren(this.domElement());
  }
  for (var i = 0, len = this.segments_.length;i < len;i++) {
    this.segments_[i].renderData();
  }
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};
acgraph.vector.Text.prototype.renderTransformation = function() {
  acgraph.getRenderer().setTextTransformation(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};
acgraph.vector.Text.prototype.deserialize = function(data) {
  this.x(data["x"]).y(data["y"]).style(data["style"]);
  data["html"] ? this.htmlText(data["text"]) : this.text(data["text"]);
  goog.base(this, "deserialize", data);
};
acgraph.vector.Text.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  data["type"] = "text";
  data["x"] = this.x();
  data["y"] = this.y();
  data["html"] = this.htmlOn_;
  data["text"] = this.text();
  data["style"] = this.style();
  return data;
};
acgraph.vector.Text.prototype.disposeInternal = function() {
  goog.disposeAll(this.segments_);
  delete this.segments_;
  delete this.textLines_;
  delete this.bounds;
  delete this.bounds;
  goog.base(this, "disposeInternal");
};
goog.exportSymbol("acgraph.vector.Text", acgraph.vector.Text);
acgraph.vector.Text.prototype["text"] = acgraph.vector.Text.prototype.text;
acgraph.vector.Text.prototype["style"] = acgraph.vector.Text.prototype.style;
acgraph.vector.Text.prototype["htmlText"] = acgraph.vector.Text.prototype.htmlText;
acgraph.vector.Text.prototype["x"] = acgraph.vector.Text.prototype.x;
acgraph.vector.Text.prototype["y"] = acgraph.vector.Text.prototype.y;
acgraph.vector.Text.prototype["fontSize"] = acgraph.vector.Text.prototype.fontSize;
acgraph.vector.Text.prototype["color"] = acgraph.vector.Text.prototype.color;
acgraph.vector.Text.prototype["fontFamily"] = acgraph.vector.Text.prototype.fontFamily;
acgraph.vector.Text.prototype["direction"] = acgraph.vector.Text.prototype.direction;
acgraph.vector.Text.prototype["fontStyle"] = acgraph.vector.Text.prototype.fontStyle;
acgraph.vector.Text.prototype["fontVariant"] = acgraph.vector.Text.prototype.fontVariant;
acgraph.vector.Text.prototype["fontWeight"] = acgraph.vector.Text.prototype.fontWeight;
acgraph.vector.Text.prototype["letterSpacing"] = acgraph.vector.Text.prototype.letterSpacing;
acgraph.vector.Text.prototype["decoration"] = acgraph.vector.Text.prototype.decoration;
acgraph.vector.Text.prototype["opacity"] = acgraph.vector.Text.prototype.opacity;
acgraph.vector.Text.prototype["lineHeight"] = acgraph.vector.Text.prototype.lineHeight;
acgraph.vector.Text.prototype["textIndent"] = acgraph.vector.Text.prototype.textIndent;
acgraph.vector.Text.prototype["vAlign"] = acgraph.vector.Text.prototype.vAlign;
acgraph.vector.Text.prototype["hAlign"] = acgraph.vector.Text.prototype.hAlign;
acgraph.vector.Text.prototype["width"] = acgraph.vector.Text.prototype.width;
acgraph.vector.Text.prototype["height"] = acgraph.vector.Text.prototype.height;
acgraph.vector.Text.prototype["textWrap"] = acgraph.vector.Text.prototype.textWrap;
acgraph.vector.Text.prototype["textOverflow"] = acgraph.vector.Text.prototype.textOverflow;
acgraph.vector.Text.prototype["selectable"] = acgraph.vector.Text.prototype.selectable;
goog.exportSymbol("acgraph.vector.Text.TextWrap.NO_WRAP", acgraph.vector.Text.TextWrap.NO_WRAP);
goog.exportSymbol("acgraph.vector.Text.TextWrap.BY_LETTER", acgraph.vector.Text.TextWrap.BY_LETTER);
goog.exportSymbol("acgraph.vector.Text.TextOverflow.CLIP", acgraph.vector.Text.TextOverflow.CLIP);
goog.exportSymbol("acgraph.vector.Text.TextOverflow.ELLIPSIS", acgraph.vector.Text.TextOverflow.ELLIPSIS);
goog.exportSymbol("acgraph.vector.Text.FontStyle.ITALIC", acgraph.vector.Text.FontStyle.ITALIC);
goog.exportSymbol("acgraph.vector.Text.FontStyle.NORMAL", acgraph.vector.Text.FontStyle.NORMAL);
goog.exportSymbol("acgraph.vector.Text.FontStyle.OBLIQUE", acgraph.vector.Text.FontStyle.OBLIQUE);
goog.exportSymbol("acgraph.vector.Text.FontVariant.NORMAL", acgraph.vector.Text.FontVariant.NORMAL);
goog.exportSymbol("acgraph.vector.Text.FontVariant.SMALL_CAP", acgraph.vector.Text.FontVariant.SMALL_CAP);
goog.exportSymbol("acgraph.vector.Text.Direction.LTR", acgraph.vector.Text.Direction.LTR);
goog.exportSymbol("acgraph.vector.Text.Direction.RTL", acgraph.vector.Text.Direction.RTL);
goog.exportSymbol("acgraph.vector.Text.Decoration.BLINK", acgraph.vector.Text.Decoration.BLINK);
goog.exportSymbol("acgraph.vector.Text.Decoration.LINE_THROUGH", acgraph.vector.Text.Decoration.LINE_THROUGH);
goog.exportSymbol("acgraph.vector.Text.Decoration.OVERLINE", acgraph.vector.Text.Decoration.OVERLINE);
goog.exportSymbol("acgraph.vector.Text.Decoration.UNDERLINE", acgraph.vector.Text.Decoration.UNDERLINE);
goog.exportSymbol("acgraph.vector.Text.Decoration.NONE", acgraph.vector.Text.Decoration.NONE);
goog.exportSymbol("acgraph.vector.Text.HAlign.START", acgraph.vector.Text.HAlign.START);
goog.exportSymbol("acgraph.vector.Text.HAlign.LEFT", acgraph.vector.Text.HAlign.LEFT);
goog.exportSymbol("acgraph.vector.Text.HAlign.CENTER", acgraph.vector.Text.HAlign.CENTER);
goog.exportSymbol("acgraph.vector.Text.HAlign.END", acgraph.vector.Text.HAlign.END);
goog.exportSymbol("acgraph.vector.Text.HAlign.RIGHT", acgraph.vector.Text.HAlign.RIGHT);
goog.exportSymbol("acgraph.vector.Text.VAlign.TOP", acgraph.vector.Text.VAlign.TOP);
goog.exportSymbol("acgraph.vector.Text.VAlign.MIDDLE", acgraph.vector.Text.VAlign.MIDDLE);
goog.exportSymbol("acgraph.vector.Text.VAlign.BOTTOM", acgraph.vector.Text.VAlign.BOTTOM);
goog.provide("acgraph.events.BrowserEvent");
goog.require("goog.events.Event");
acgraph.events.BrowserEvent = function(e, stage) {
  goog.base(this, e.type);
  this["target"] = acgraph.getWrapperForDOM((e.target), stage) || e.target;
  this["relatedTarget"] = acgraph.getWrapperForDOM((e.relatedTarget || null), stage) || e.relatedTarget;
  this["offsetX"] = e.offsetX;
  this["offsetY"] = e.offsetY;
  this["clientX"] = e.clientX;
  this["clientY"] = e.clientY;
  this["screenX"] = e.screenX;
  this["screenY"] = e.screenY;
  this["button"] = e.isButton(goog.events.BrowserEvent.MouseButton.LEFT) ? acgraph.events.BrowserEvent.MouseButton.LEFT : e.isButton(goog.events.BrowserEvent.MouseButton.MIDDLE) ? acgraph.events.BrowserEvent.MouseButton.MIDDLE : e.isButton(goog.events.BrowserEvent.MouseButton.RIGHT) ? acgraph.events.BrowserEvent.MouseButton.RIGHT : acgraph.events.BrowserEvent.MouseButton.NONE;
  this["actionButton"] = e.isMouseActionButton();
  this["keyCode"] = e.keyCode;
  this["charCode"] = e.charCode;
  this["ctrlKey"] = e.ctrlKey;
  this["altKey"] = e.altKey;
  this["shiftKey"] = e.shiftKey;
  this["metaKey"] = e.metaKey;
  this["platformModifierKey"] = e.platformModifierKey;
  this.event_ = e;
};
goog.inherits(acgraph.events.BrowserEvent, goog.events.Event);
acgraph.events.BrowserEvent.MouseButton = {LEFT:"left", MIDDLE:"middle", RIGHT:"right", NONE:"none"};
acgraph.events.BrowserEvent.prototype.preventDefault = function() {
  goog.base(this, "preventDefault");
  this.event_.preventDefault();
};
acgraph.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.base(this, "stopPropagation");
  this.event_.stopPropagation();
};
acgraph.events.BrowserEvent.prototype.stopWrapperPropagation = function() {
  goog.events.Event.prototype.stopPropagation.call(this);
};
acgraph.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.event_.isMouseActionButton();
};
acgraph.events.BrowserEvent.prototype.getOriginalEvent = function() {
  return this.event_;
};
acgraph.events.BrowserEvent.prototype["stopPropagation"] = acgraph.events.BrowserEvent.prototype.stopPropagation;
acgraph.events.BrowserEvent.prototype["stopWrapperPropagation"] = acgraph.events.BrowserEvent.prototype.stopWrapperPropagation;
acgraph.events.BrowserEvent.prototype["preventDefault"] = acgraph.events.BrowserEvent.prototype.preventDefault;
goog.provide("acgraph.utils.exporting");
goog.require("goog.Timer");
goog.require("goog.dom");
goog.require("goog.style");
acgraph.utils.exporting.PaperSize = {"usletter":{width:"215.9mm", height:"279.4mm"}, "a0":{width:"841mm", height:"1189mm"}, "a1":{width:"594mm", height:"841mm"}, "a2":{width:"420mm", height:"594mm"}, "a3":{width:"297mm", height:"420mm"}, "a4":{width:"210mm", height:"297mm"}, "a5":{width:"148mm", height:"210mm"}, "a6":{width:"105mm", height:"148mm"}};
acgraph.utils.exporting.PdfPaperSize = {"a0":{width:2384, height:3370}, "a1":{width:1684, height:2384}, "a2":{width:1191, height:1684}, "a3":{width:842, height:1191}, "a4":{width:595, height:842}, "a5":{width:420, height:595}, "a6":{width:297, height:420}, "a7":{width:210, height:297}, "a8":{width:48, height:210}, "a9":{width:105, height:148}, "b0":{width:2834, height:4008}, "b1":{width:2004, height:2834}, "b2":{width:1417, height:2004}, "b3":{width:1E3, height:1417}, "b4":{width:708, height:1E3}, 
"b5":{width:498, height:708}, "b6":{width:354, height:498}, "b7":{width:249, height:354}, "b8":{width:175, height:249}, "b9":{width:124, height:175}, "arch-a":{width:648, height:864}, "arch-b":{width:864, height:1296}, "arch-c":{width:1296, height:1728}, "arch-d":{width:1728, height:2592}, "arch-e":{width:2592, height:3456}, "crown-octavo":{width:348, height:527}, "crown-quarto":{width:535, height:697}, "demy-octavo":{width:391, height:612}, "demy-quarto":{width:620, height:782}, "royal-octavo":{width:442, 
height:663}, "royal-quarto":{width:671, height:884}, "executive":{width:522, height:756}, "halfletter":{width:396, height:612}, "ledger":{width:1224, height:792}, "legal":{width:612, height:1008}, "letter":{width:612, height:792}, "tabloid":{width:792, height:1224}};
acgraph.utils.exporting.printIFrame_ = null;
acgraph.utils.exporting.printWindow_ = null;
acgraph.utils.exporting.print = function(stage, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  if (goog.isDef(opt_paperSizeOrWidth) || goog.isDef(opt_landscapeOrHeight)) {
    acgraph.utils.exporting.fullPagePrint(stage, opt_paperSizeOrWidth, opt_landscapeOrHeight);
  } else {
    acgraph.utils.exporting.fitToPagePrint(stage);
  }
};
acgraph.utils.exporting.fitToPagePrint = function(stage) {
  var iFrame = acgraph.utils.exporting.createPrint_();
  var iFrameDocument = iFrame["contentWindow"].document;
  var stageDom = stage.domElement();
  if (stageDom.tagName == "svg") {
    var stageClone, stageDomClone;
    if (stageDom.cloneNode) {
      stageDomClone = stageDom.cloneNode(true);
    } else {
      stageClone = acgraph.create(iFrameDocument.body);
      stageClone.data(stage.data());
      stageDomClone = stageClone.domElement();
    }
  } else {
    stageClone = acgraph.create(iFrameDocument.body);
    stageClone.data(stage.data());
  }
  acgraph.getRenderer().setPrintAttributes(stageDomClone, stage);
  goog.dom.appendChild(iFrameDocument.body, (stageDomClone));
  acgraph.utils.exporting.openPrint_();
};
acgraph.utils.exporting.fullPagePrint = function(stage, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var size = acgraph.vector.normalizePageSize(opt_paperSizeOrWidth, opt_landscapeOrHeight, acgraph.vector.PaperSize.US_LETTER);
  var iFrame = acgraph.utils.exporting.createPrint_();
  var iFrameDocument = iFrame["contentWindow"].document;
  var div = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.style.setStyle(div, {"width":size.width, "height":size.height});
  iFrameDocument.body.appendChild(div);
  var sourceDiv = goog.dom.getParentElement(stage.domElement());
  var sourceWidth = goog.style.getStyle(sourceDiv, "width");
  var sourceHeight = goog.style.getStyle(sourceDiv, "height");
  goog.style.setSize(sourceDiv, size.width, size.height);
  stage.updateSizeFromContainer();
  var stageDom = stage.domElement();
  if (stageDom.tagName == "svg" && stageDom.cloneNode) {
    goog.dom.appendChild(div, stageDom.cloneNode(true));
  } else {
    var newStage = acgraph.create(div);
    newStage.data(stage.data());
  }
  goog.style.setStyle(sourceDiv, "width", sourceWidth);
  goog.style.setStyle(sourceDiv, "height", sourceHeight);
  stage.updateSizeFromContainer();
  acgraph.utils.exporting.openPrint_();
};
acgraph.utils.exporting.createPrint_ = function() {
  if (!acgraph.utils.exporting.printIFrame_) {
    var iFrame = document.createElement("iframe");
    acgraph.utils.exporting.printIFrame_ = iFrame;
    goog.style.setStyle(iFrame, {"visibility":"hidden", "position":"fixed", "right":0, "bottom":0});
    goog.dom.appendChild(document.body, iFrame);
    var rules = goog.cssom.getAllCssStyleRules();
    var rule;
    for (var i = 0, len = rules.length;i < len;i++) {
      rule = rules[i];
      if (rule.type == goog.cssom.CssRuleType.FONT_FACE) {
        acgraph.embedCss(goog.cssom.getCssTextFromCssRule((rule)), iFrame["contentWindow"].document);
      }
    }
    acgraph.embedCss("body{padding:0;margin:0;height:100%;}", iFrame["contentWindow"].document);
  }
  return acgraph.utils.exporting.printIFrame_;
};
acgraph.utils.exporting.openPrint_ = function() {
  if (acgraph.utils.exporting.printIFrame_) {
    var iFrame = acgraph.utils.exporting.printIFrame_;
    var iFrameWindow = iFrame["contentWindow"];
    if (goog.userAgent.EDGE) {
      acgraph.utils.exporting.printWindow_ = window.open();
      acgraph.utils.exporting.printWindow_.document.write(iFrameWindow.document.documentElement.innerHTML);
      acgraph.utils.exporting.disposePrint_();
      acgraph.utils.exporting.printWindow_["onafterprint"] = function() {
        setTimeout(function() {
          acgraph.utils.exporting.printWindow_.close();
        }, 0);
      };
      setTimeout(function() {
        acgraph.utils.exporting.printWindow_["focus"]();
        acgraph.utils.exporting.printWindow_["print"]();
      }, 0);
    } else {
      if (goog.userAgent.IE) {
        setTimeout(function() {
          goog.style.setStyle(iFrame, "visibility", "");
          iFrameWindow["onafterprint"] = acgraph.utils.exporting.disposePrint_;
          iFrameWindow["focus"]();
          iFrameWindow["print"]();
        }, 0);
      } else {
        goog.Timer.callOnce(acgraph.utils.exporting.disposePrint_, 6);
        iFrameWindow["focus"]();
        iFrameWindow["print"]();
      }
    }
  }
};
acgraph.utils.exporting.onBeforePrint_ = function() {
};
acgraph.utils.exporting.onAfterPrint_ = function() {
};
acgraph.utils.exporting.disposePrint_ = function() {
  if (acgraph.utils.exporting.printIFrame_) {
    document.body.removeChild(acgraph.utils.exporting.printIFrame_);
    acgraph.utils.exporting.printIFrame_ = null;
  }
};
goog.provide("acgraph.vector.Circle");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Ellipse");
acgraph.vector.Circle = function(opt_centerX, opt_centerY, opt_radius) {
  goog.base(this, opt_centerX, opt_centerY, opt_radius, opt_radius);
};
goog.inherits(acgraph.vector.Circle, acgraph.vector.Ellipse);
acgraph.vector.Circle.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.CIRCLE;
};
acgraph.vector.Circle.prototype.radius = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.radiusX(opt_value);
    this.radiusY(opt_value);
    return this;
  }
  return (this.radiusX());
};
acgraph.vector.Circle.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createCircleElement();
};
acgraph.vector.Circle.prototype.renderData = function() {
  acgraph.getRenderer().setCircleProperties(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};
acgraph.vector.Circle.prototype.deserialize = function(data) {
  this.radiusX(data["radius"]);
  goog.base(this, "deserialize", data);
};
acgraph.vector.Circle.prototype.serialize = function() {
  var data = goog.base(this, "serialize");
  data["type"] = "circle";
  delete data["rx"];
  delete data["ry"];
  data["radius"] = this.radiusX();
  return data;
};
goog.exportSymbol("acgraph.vector.Circle", acgraph.vector.Circle);
acgraph.vector.Circle.prototype["radius"] = acgraph.vector.Circle.prototype.radius;
goog.provide("goog.Uri");
goog.provide("goog.Uri.QueryData");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.string");
goog.require("goog.structs");
goog.require("goog.structs.Map");
goog.require("goog.uri.utils");
goog.require("goog.uri.utils.ComponentIndex");
goog.require("goog.uri.utils.StandardQueryParam");
goog.Uri = function(opt_uri, opt_ignoreCase) {
  this.scheme_ = "";
  this.userInfo_ = "";
  this.domain_ = "";
  this.port_ = null;
  this.path_ = "";
  this.fragment_ = "";
  this.isReadOnly_ = false;
  this.ignoreCase_ = false;
  this.queryData_;
  var m;
  if (opt_uri instanceof goog.Uri) {
    this.ignoreCase_ = goog.isDef(opt_ignoreCase) ? opt_ignoreCase : opt_uri.getIgnoreCase();
    this.setScheme(opt_uri.getScheme());
    this.setUserInfo(opt_uri.getUserInfo());
    this.setDomain(opt_uri.getDomain());
    this.setPort(opt_uri.getPort());
    this.setPath(opt_uri.getPath());
    this.setQueryData(opt_uri.getQueryData().clone());
    this.setFragment(opt_uri.getFragment());
  } else {
    if (opt_uri && (m = goog.uri.utils.split(String(opt_uri)))) {
      this.ignoreCase_ = !!opt_ignoreCase;
      this.setScheme(m[goog.uri.utils.ComponentIndex.SCHEME] || "", true);
      this.setUserInfo(m[goog.uri.utils.ComponentIndex.USER_INFO] || "", true);
      this.setDomain(m[goog.uri.utils.ComponentIndex.DOMAIN] || "", true);
      this.setPort(m[goog.uri.utils.ComponentIndex.PORT]);
      this.setPath(m[goog.uri.utils.ComponentIndex.PATH] || "", true);
      this.setQueryData(m[goog.uri.utils.ComponentIndex.QUERY_DATA] || "", true);
      this.setFragment(m[goog.uri.utils.ComponentIndex.FRAGMENT] || "", true);
    } else {
      this.ignoreCase_ = !!opt_ignoreCase;
      this.queryData_ = new goog.Uri.QueryData(null, null, this.ignoreCase_);
    }
  }
};
goog.Uri.preserveParameterTypesCompatibilityFlag = false;
goog.Uri.RANDOM_PARAM = goog.uri.utils.StandardQueryParam.RANDOM;
goog.Uri.prototype.toString = function() {
  var out = [];
  var scheme = this.getScheme();
  if (scheme) {
    out.push(goog.Uri.encodeSpecialChars_(scheme, goog.Uri.reDisallowedInSchemeOrUserInfo_, true), ":");
  }
  var domain = this.getDomain();
  if (domain || scheme == "file") {
    out.push("//");
    var userInfo = this.getUserInfo();
    if (userInfo) {
      out.push(goog.Uri.encodeSpecialChars_(userInfo, goog.Uri.reDisallowedInSchemeOrUserInfo_, true), "@");
    }
    out.push(goog.Uri.removeDoubleEncoding_(goog.string.urlEncode(domain)));
    var port = this.getPort();
    if (port != null) {
      out.push(":", String(port));
    }
  }
  var path = this.getPath();
  if (path) {
    if (this.hasDomain() && path.charAt(0) != "/") {
      out.push("/");
    }
    out.push(goog.Uri.encodeSpecialChars_(path, path.charAt(0) == "/" ? goog.Uri.reDisallowedInAbsolutePath_ : goog.Uri.reDisallowedInRelativePath_, true));
  }
  var query = this.getEncodedQuery();
  if (query) {
    out.push("?", query);
  }
  var fragment = this.getFragment();
  if (fragment) {
    out.push("#", goog.Uri.encodeSpecialChars_(fragment, goog.Uri.reDisallowedInFragment_));
  }
  return out.join("");
};
goog.Uri.prototype.resolve = function(relativeUri) {
  var absoluteUri = this.clone();
  var overridden = relativeUri.hasScheme();
  if (overridden) {
    absoluteUri.setScheme(relativeUri.getScheme());
  } else {
    overridden = relativeUri.hasUserInfo();
  }
  if (overridden) {
    absoluteUri.setUserInfo(relativeUri.getUserInfo());
  } else {
    overridden = relativeUri.hasDomain();
  }
  if (overridden) {
    absoluteUri.setDomain(relativeUri.getDomain());
  } else {
    overridden = relativeUri.hasPort();
  }
  var path = relativeUri.getPath();
  if (overridden) {
    absoluteUri.setPort(relativeUri.getPort());
  } else {
    overridden = relativeUri.hasPath();
    if (overridden) {
      if (path.charAt(0) != "/") {
        if (this.hasDomain() && !this.hasPath()) {
          path = "/" + path;
        } else {
          var lastSlashIndex = absoluteUri.getPath().lastIndexOf("/");
          if (lastSlashIndex != -1) {
            path = absoluteUri.getPath().substr(0, lastSlashIndex + 1) + path;
          }
        }
      }
      path = goog.Uri.removeDotSegments(path);
    }
  }
  if (overridden) {
    absoluteUri.setPath(path);
  } else {
    overridden = relativeUri.hasQuery();
  }
  if (overridden) {
    absoluteUri.setQueryData(relativeUri.getDecodedQuery());
  } else {
    overridden = relativeUri.hasFragment();
  }
  if (overridden) {
    absoluteUri.setFragment(relativeUri.getFragment());
  }
  return absoluteUri;
};
goog.Uri.prototype.clone = function() {
  return new goog.Uri(this);
};
goog.Uri.prototype.getScheme = function() {
  return this.scheme_;
};
goog.Uri.prototype.setScheme = function(newScheme, opt_decode) {
  this.enforceReadOnly();
  this.scheme_ = opt_decode ? goog.Uri.decodeOrEmpty_(newScheme, true) : newScheme;
  if (this.scheme_) {
    this.scheme_ = this.scheme_.replace(/:$/, "");
  }
  return this;
};
goog.Uri.prototype.hasScheme = function() {
  return !!this.scheme_;
};
goog.Uri.prototype.getUserInfo = function() {
  return this.userInfo_;
};
goog.Uri.prototype.setUserInfo = function(newUserInfo, opt_decode) {
  this.enforceReadOnly();
  this.userInfo_ = opt_decode ? goog.Uri.decodeOrEmpty_(newUserInfo) : newUserInfo;
  return this;
};
goog.Uri.prototype.hasUserInfo = function() {
  return !!this.userInfo_;
};
goog.Uri.prototype.getDomain = function() {
  return this.domain_;
};
goog.Uri.prototype.setDomain = function(newDomain, opt_decode) {
  this.enforceReadOnly();
  this.domain_ = opt_decode ? goog.Uri.decodeOrEmpty_(newDomain, true) : newDomain;
  return this;
};
goog.Uri.prototype.hasDomain = function() {
  return !!this.domain_;
};
goog.Uri.prototype.getPort = function() {
  return this.port_;
};
goog.Uri.prototype.setPort = function(newPort) {
  this.enforceReadOnly();
  if (newPort) {
    newPort = Number(newPort);
    if (isNaN(newPort) || newPort < 0) {
      throw Error("Bad port number " + newPort);
    }
    this.port_ = newPort;
  } else {
    this.port_ = null;
  }
  return this;
};
goog.Uri.prototype.hasPort = function() {
  return this.port_ != null;
};
goog.Uri.prototype.getPath = function() {
  return this.path_;
};
goog.Uri.prototype.setPath = function(newPath, opt_decode) {
  this.enforceReadOnly();
  this.path_ = opt_decode ? goog.Uri.decodeOrEmpty_(newPath, true) : newPath;
  return this;
};
goog.Uri.prototype.hasPath = function() {
  return !!this.path_;
};
goog.Uri.prototype.hasQuery = function() {
  return this.queryData_.toString() !== "";
};
goog.Uri.prototype.setQueryData = function(queryData, opt_decode) {
  this.enforceReadOnly();
  if (queryData instanceof goog.Uri.QueryData) {
    this.queryData_ = queryData;
    this.queryData_.setIgnoreCase(this.ignoreCase_);
  } else {
    if (!opt_decode) {
      queryData = goog.Uri.encodeSpecialChars_(queryData, goog.Uri.reDisallowedInQuery_);
    }
    this.queryData_ = new goog.Uri.QueryData(queryData, null, this.ignoreCase_);
  }
  return this;
};
goog.Uri.prototype.setQuery = function(newQuery, opt_decode) {
  return this.setQueryData(newQuery, opt_decode);
};
goog.Uri.prototype.getEncodedQuery = function() {
  return this.queryData_.toString();
};
goog.Uri.prototype.getDecodedQuery = function() {
  return this.queryData_.toDecodedString();
};
goog.Uri.prototype.getQueryData = function() {
  return this.queryData_;
};
goog.Uri.prototype.getQuery = function() {
  return this.getEncodedQuery();
};
goog.Uri.prototype.setParameterValue = function(key, value) {
  this.enforceReadOnly();
  this.queryData_.set(key, value);
  return this;
};
goog.Uri.prototype.setParameterValues = function(key, values) {
  this.enforceReadOnly();
  if (!goog.isArray(values)) {
    values = [String(values)];
  }
  this.queryData_.setValues(key, values);
  return this;
};
goog.Uri.prototype.getParameterValues = function(name) {
  return this.queryData_.getValues(name);
};
goog.Uri.prototype.getParameterValue = function(paramName) {
  return (this.queryData_.get(paramName));
};
goog.Uri.prototype.getFragment = function() {
  return this.fragment_;
};
goog.Uri.prototype.setFragment = function(newFragment, opt_decode) {
  this.enforceReadOnly();
  this.fragment_ = opt_decode ? goog.Uri.decodeOrEmpty_(newFragment) : newFragment;
  return this;
};
goog.Uri.prototype.hasFragment = function() {
  return !!this.fragment_;
};
goog.Uri.prototype.hasSameDomainAs = function(uri2) {
  return (!this.hasDomain() && !uri2.hasDomain() || this.getDomain() == uri2.getDomain()) && (!this.hasPort() && !uri2.hasPort() || this.getPort() == uri2.getPort());
};
goog.Uri.prototype.makeUnique = function() {
  this.enforceReadOnly();
  this.setParameterValue(goog.Uri.RANDOM_PARAM, goog.string.getRandomString());
  return this;
};
goog.Uri.prototype.removeParameter = function(key) {
  this.enforceReadOnly();
  this.queryData_.remove(key);
  return this;
};
goog.Uri.prototype.setReadOnly = function(isReadOnly) {
  this.isReadOnly_ = isReadOnly;
  return this;
};
goog.Uri.prototype.isReadOnly = function() {
  return this.isReadOnly_;
};
goog.Uri.prototype.enforceReadOnly = function() {
  if (this.isReadOnly_) {
    throw Error("Tried to modify a read-only Uri");
  }
};
goog.Uri.prototype.setIgnoreCase = function(ignoreCase) {
  this.ignoreCase_ = ignoreCase;
  if (this.queryData_) {
    this.queryData_.setIgnoreCase(ignoreCase);
  }
  return this;
};
goog.Uri.prototype.getIgnoreCase = function() {
  return this.ignoreCase_;
};
goog.Uri.parse = function(uri, opt_ignoreCase) {
  return uri instanceof goog.Uri ? uri.clone() : new goog.Uri(uri, opt_ignoreCase);
};
goog.Uri.create = function(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_query, opt_fragment, opt_ignoreCase) {
  var uri = new goog.Uri(null, opt_ignoreCase);
  opt_scheme && uri.setScheme(opt_scheme);
  opt_userInfo && uri.setUserInfo(opt_userInfo);
  opt_domain && uri.setDomain(opt_domain);
  opt_port && uri.setPort(opt_port);
  opt_path && uri.setPath(opt_path);
  opt_query && uri.setQueryData(opt_query);
  opt_fragment && uri.setFragment(opt_fragment);
  return uri;
};
goog.Uri.resolve = function(base, rel) {
  if (!(base instanceof goog.Uri)) {
    base = goog.Uri.parse(base);
  }
  if (!(rel instanceof goog.Uri)) {
    rel = goog.Uri.parse(rel);
  }
  return base.resolve(rel);
};
goog.Uri.removeDotSegments = function(path) {
  if (path == ".." || path == ".") {
    return "";
  } else {
    if (!goog.string.contains(path, "./") && !goog.string.contains(path, "/.")) {
      return path;
    } else {
      var leadingSlash = goog.string.startsWith(path, "/");
      var segments = path.split("/");
      var out = [];
      for (var pos = 0;pos < segments.length;) {
        var segment = segments[pos++];
        if (segment == ".") {
          if (leadingSlash && pos == segments.length) {
            out.push("");
          }
        } else {
          if (segment == "..") {
            if (out.length > 1 || out.length == 1 && out[0] != "") {
              out.pop();
            }
            if (leadingSlash && pos == segments.length) {
              out.push("");
            }
          } else {
            out.push(segment);
            leadingSlash = true;
          }
        }
      }
      return out.join("/");
    }
  }
};
goog.Uri.decodeOrEmpty_ = function(val, opt_preserveReserved) {
  if (!val) {
    return "";
  }
  return opt_preserveReserved ? decodeURI(val.replace(/%25/g, "%2525")) : decodeURIComponent(val);
};
goog.Uri.encodeSpecialChars_ = function(unescapedPart, extra, opt_removeDoubleEncoding) {
  if (goog.isString(unescapedPart)) {
    var encoded = encodeURI(unescapedPart).replace(extra, goog.Uri.encodeChar_);
    if (opt_removeDoubleEncoding) {
      encoded = goog.Uri.removeDoubleEncoding_(encoded);
    }
    return encoded;
  }
  return null;
};
goog.Uri.encodeChar_ = function(ch) {
  var n = ch.charCodeAt(0);
  return "%" + (n >> 4 & 15).toString(16) + (n & 15).toString(16);
};
goog.Uri.removeDoubleEncoding_ = function(doubleEncodedString) {
  return doubleEncodedString.replace(/%25([0-9a-fA-F]{2})/g, "%$1");
};
goog.Uri.reDisallowedInSchemeOrUserInfo_ = /[#\/\?@]/g;
goog.Uri.reDisallowedInRelativePath_ = /[\#\?:]/g;
goog.Uri.reDisallowedInAbsolutePath_ = /[\#\?]/g;
goog.Uri.reDisallowedInQuery_ = /[\#\?@]/g;
goog.Uri.reDisallowedInFragment_ = /#/g;
goog.Uri.haveSameDomain = function(uri1String, uri2String) {
  var pieces1 = goog.uri.utils.split(uri1String);
  var pieces2 = goog.uri.utils.split(uri2String);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] == pieces2[goog.uri.utils.ComponentIndex.DOMAIN] && pieces1[goog.uri.utils.ComponentIndex.PORT] == pieces2[goog.uri.utils.ComponentIndex.PORT];
};
goog.Uri.QueryData = function(opt_query, opt_uri, opt_ignoreCase) {
  this.keyMap_ = null;
  this.count_ = null;
  this.encodedQuery_ = opt_query || null;
  this.ignoreCase_ = !!opt_ignoreCase;
};
goog.Uri.QueryData.prototype.ensureKeyMapInitialized_ = function() {
  if (!this.keyMap_) {
    this.keyMap_ = new goog.structs.Map;
    this.count_ = 0;
    if (this.encodedQuery_) {
      var self = this;
      goog.uri.utils.parseQueryData(this.encodedQuery_, function(name, value) {
        self.add(goog.string.urlDecode(name), value);
      });
    }
  }
};
goog.Uri.QueryData.createFromMap = function(map, opt_uri, opt_ignoreCase) {
  var keys = goog.structs.getKeys(map);
  if (typeof keys == "undefined") {
    throw Error("Keys are undefined");
  }
  var queryData = new goog.Uri.QueryData(null, null, opt_ignoreCase);
  var values = goog.structs.getValues(map);
  for (var i = 0;i < keys.length;i++) {
    var key = keys[i];
    var value = values[i];
    if (!goog.isArray(value)) {
      queryData.add(key, value);
    } else {
      queryData.setValues(key, value);
    }
  }
  return queryData;
};
goog.Uri.QueryData.createFromKeysValues = function(keys, values, opt_uri, opt_ignoreCase) {
  if (keys.length != values.length) {
    throw Error("Mismatched lengths for keys/values");
  }
  var queryData = new goog.Uri.QueryData(null, null, opt_ignoreCase);
  for (var i = 0;i < keys.length;i++) {
    queryData.add(keys[i], values[i]);
  }
  return queryData;
};
goog.Uri.QueryData.prototype.getCount = function() {
  this.ensureKeyMapInitialized_();
  return this.count_;
};
goog.Uri.QueryData.prototype.add = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();
  key = this.getKeyName_(key);
  var values = this.keyMap_.get(key);
  if (!values) {
    this.keyMap_.set(key, values = []);
  }
  values.push(value);
  this.count_ = goog.asserts.assertNumber(this.count_) + 1;
  return this;
};
goog.Uri.QueryData.prototype.remove = function(key) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  if (this.keyMap_.containsKey(key)) {
    this.invalidateCache_();
    this.count_ = goog.asserts.assertNumber(this.count_) - this.keyMap_.get(key).length;
    return this.keyMap_.remove(key);
  }
  return false;
};
goog.Uri.QueryData.prototype.clear = function() {
  this.invalidateCache_();
  this.keyMap_ = null;
  this.count_ = 0;
};
goog.Uri.QueryData.prototype.isEmpty = function() {
  this.ensureKeyMapInitialized_();
  return this.count_ == 0;
};
goog.Uri.QueryData.prototype.containsKey = function(key) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  return this.keyMap_.containsKey(key);
};
goog.Uri.QueryData.prototype.containsValue = function(value) {
  var vals = this.getValues();
  return goog.array.contains(vals, value);
};
goog.Uri.QueryData.prototype.getKeys = function() {
  this.ensureKeyMapInitialized_();
  var vals = (this.keyMap_.getValues());
  var keys = this.keyMap_.getKeys();
  var rv = [];
  for (var i = 0;i < keys.length;i++) {
    var val = vals[i];
    for (var j = 0;j < val.length;j++) {
      rv.push(keys[i]);
    }
  }
  return rv;
};
goog.Uri.QueryData.prototype.getValues = function(opt_key) {
  this.ensureKeyMapInitialized_();
  var rv = [];
  if (goog.isString(opt_key)) {
    if (this.containsKey(opt_key)) {
      rv = goog.array.concat(rv, this.keyMap_.get(this.getKeyName_(opt_key)));
    }
  } else {
    var values = this.keyMap_.getValues();
    for (var i = 0;i < values.length;i++) {
      rv = goog.array.concat(rv, values[i]);
    }
  }
  return rv;
};
goog.Uri.QueryData.prototype.set = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();
  key = this.getKeyName_(key);
  if (this.containsKey(key)) {
    this.count_ = goog.asserts.assertNumber(this.count_) - this.keyMap_.get(key).length;
  }
  this.keyMap_.set(key, [value]);
  this.count_ = goog.asserts.assertNumber(this.count_) + 1;
  return this;
};
goog.Uri.QueryData.prototype.get = function(key, opt_default) {
  var values = key ? this.getValues(key) : [];
  if (goog.Uri.preserveParameterTypesCompatibilityFlag) {
    return values.length > 0 ? values[0] : opt_default;
  } else {
    return values.length > 0 ? String(values[0]) : opt_default;
  }
};
goog.Uri.QueryData.prototype.setValues = function(key, values) {
  this.remove(key);
  if (values.length > 0) {
    this.invalidateCache_();
    this.keyMap_.set(this.getKeyName_(key), goog.array.clone(values));
    this.count_ = goog.asserts.assertNumber(this.count_) + values.length;
  }
};
goog.Uri.QueryData.prototype.toString = function() {
  if (this.encodedQuery_) {
    return this.encodedQuery_;
  }
  if (!this.keyMap_) {
    return "";
  }
  var sb = [];
  var keys = this.keyMap_.getKeys();
  for (var i = 0;i < keys.length;i++) {
    var key = keys[i];
    var encodedKey = goog.string.urlEncode(key);
    var val = this.getValues(key);
    for (var j = 0;j < val.length;j++) {
      var param = encodedKey;
      if (val[j] !== "") {
        param += "=" + goog.string.urlEncode(val[j]);
      }
      sb.push(param);
    }
  }
  return this.encodedQuery_ = sb.join("&");
};
goog.Uri.QueryData.prototype.toDecodedString = function() {
  return goog.Uri.decodeOrEmpty_(this.toString());
};
goog.Uri.QueryData.prototype.invalidateCache_ = function() {
  this.encodedQuery_ = null;
};
goog.Uri.QueryData.prototype.filterKeys = function(keys) {
  this.ensureKeyMapInitialized_();
  this.keyMap_.forEach(function(value, key) {
    if (!goog.array.contains(keys, key)) {
      this.remove(key);
    }
  }, this);
  return this;
};
goog.Uri.QueryData.prototype.clone = function() {
  var rv = new goog.Uri.QueryData;
  rv.encodedQuery_ = this.encodedQuery_;
  if (this.keyMap_) {
    rv.keyMap_ = this.keyMap_.clone();
    rv.count_ = this.count_;
  }
  return rv;
};
goog.Uri.QueryData.prototype.getKeyName_ = function(arg) {
  var keyName = String(arg);
  if (this.ignoreCase_) {
    keyName = keyName.toLowerCase();
  }
  return keyName;
};
goog.Uri.QueryData.prototype.setIgnoreCase = function(ignoreCase) {
  var resetKeys = ignoreCase && !this.ignoreCase_;
  if (resetKeys) {
    this.ensureKeyMapInitialized_();
    this.invalidateCache_();
    this.keyMap_.forEach(function(value, key) {
      var lowerCase = key.toLowerCase();
      if (key != lowerCase) {
        this.remove(key);
        this.setValues(lowerCase, value);
      }
    }, this);
  }
  this.ignoreCase_ = ignoreCase;
};
goog.Uri.QueryData.prototype.extend = function(var_args) {
  for (var i = 0;i < arguments.length;i++) {
    var data = arguments[i];
    goog.structs.forEach(data, function(value, key) {
      this.add(key, value);
    }, this);
  }
};
goog.provide("acgraph.vector.Clip");
goog.require("acgraph.math.Rect");
goog.require("acgraph.vector.ILayer");
goog.require("goog.Disposable");
goog.require("goog.array");
acgraph.vector.Clip = function(stage, opt_leftOrShape, opt_top, opt_width, opt_height) {
  goog.base(this);
  this.stage_ = stage;
  this.dirty_ = false;
  this.elements = [];
  this.id_ = null;
  this.shape_ = null;
  this.shape.apply(this, goog.array.slice(arguments, 1));
};
goog.inherits(acgraph.vector.Clip, goog.Disposable);
acgraph.vector.Clip.prototype.stage = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.stage_ = opt_value;
    if (this.dirty_) {
      this.stage_.addClipForRender(this);
    }
    return this;
  }
  return this.stage_;
};
acgraph.vector.Clip.prototype.shape = function(opt_leftOrShape, opt_top, opt_width, opt_height) {
  if (arguments.length) {
    if (opt_leftOrShape instanceof acgraph.vector.Shape) {
      if (this.shape_) {
        var sameType = this.shape_ instanceof acgraph.vector.Rect && opt_leftOrShape instanceof acgraph.vector.Rect || this.shape_ instanceof acgraph.vector.Circle && opt_leftOrShape instanceof acgraph.vector.Circle || this.shape_ instanceof acgraph.vector.Ellipse && opt_leftOrShape instanceof acgraph.vector.Ellipse || this.shape_ instanceof acgraph.vector.Path && opt_leftOrShape instanceof acgraph.vector.Path;
        if (sameType) {
          this.shape_.deserialize(opt_leftOrShape.serialize());
        } else {
          this.shape_.parent(null);
          this.shape_ = opt_leftOrShape;
          this.shape_.parent(this);
        }
      } else {
        this.shape_ = opt_leftOrShape;
        this.shape_.parent(this);
      }
    } else {
      var left, top, width, height;
      if (opt_leftOrShape instanceof acgraph.math.Rect) {
        left = opt_leftOrShape.left;
        top = opt_leftOrShape.top;
        width = opt_leftOrShape.width;
        height = opt_leftOrShape.height;
      } else {
        if (goog.isArray(opt_leftOrShape)) {
          left = goog.isDefAndNotNull(opt_leftOrShape[0]) ? opt_leftOrShape[0] : 0;
          top = goog.isDefAndNotNull(opt_leftOrShape[1]) ? opt_leftOrShape[1] : 0;
          width = goog.isDefAndNotNull(opt_leftOrShape[2]) ? opt_leftOrShape[2] : 0;
          height = goog.isDefAndNotNull(opt_leftOrShape[3]) ? opt_leftOrShape[3] : 0;
        } else {
          if (goog.isObject(opt_leftOrShape)) {
            left = goog.isDefAndNotNull(opt_leftOrShape["left"]) ? opt_leftOrShape["left"] : 0;
            top = goog.isDefAndNotNull(opt_leftOrShape["top"]) ? opt_leftOrShape["top"] : 0;
            width = goog.isDefAndNotNull(opt_leftOrShape["width"]) ? opt_leftOrShape["width"] : 0;
            height = goog.isDefAndNotNull(opt_leftOrShape["height"]) ? opt_leftOrShape["height"] : 0;
          } else {
            left = goog.isDefAndNotNull(opt_leftOrShape) ? opt_leftOrShape : 0;
            top = goog.isDefAndNotNull(opt_top) ? opt_top : 0;
            width = goog.isDefAndNotNull(opt_width) ? opt_width : 0;
            height = goog.isDefAndNotNull(opt_height) ? opt_height : 0;
          }
        }
      }
      if (this.shape_) {
        if (this.shape_ instanceof acgraph.vector.Rect) {
          this.shape_.setX(left).setY(top).setWidth(width).setHeight(height);
        } else {
          this.shape_.parent(null);
          this.shape_ = acgraph.rect(left, top, width, height);
          this.shape_.parent(this);
        }
      } else {
        this.shape_ = acgraph.rect(left, top, width, height);
        this.shape_.parent(this);
      }
    }
    return this;
  }
  return this.shape_;
};
acgraph.vector.Clip.prototype.isDirty = function() {
  return this.dirty_;
};
acgraph.vector.Clip.prototype.needUpdateClip_ = function() {
  if (!this.dirty_) {
    this.dirty_ = true;
    if (this.stage_) {
      this.stage_.addClipForRender(this);
    }
  }
};
acgraph.vector.Clip.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.id_ = opt_value;
    return this;
  }
  return this.id_;
};
acgraph.vector.Clip.prototype.render = function() {
  this.dirty_ = false;
  if (!this.id_) {
    return;
  }
  acgraph.getRenderer().updateClip(this);
};
acgraph.vector.Clip.prototype.addElement = function(element) {
  goog.array.insert(this.elements, element);
};
acgraph.vector.Clip.prototype.removeElement = function(element) {
  goog.array.remove(this.elements, element);
};
acgraph.vector.Clip.prototype.getElements = function() {
  return this.elements;
};
acgraph.vector.Clip.prototype.serialize = function() {
  return this.shape_.serialize();
};
acgraph.vector.Clip.prototype.deserialize = function(data) {
  var type = data["type"];
  var primitive;
  switch(type) {
    case "rect":
      primitive = acgraph.rect();
      break;
    case "circle":
      primitive = acgraph.circle();
      break;
    case "ellipse":
      primitive = acgraph.ellipse();
      break;
    case "path":
      primitive = acgraph.path();
      break;
    default:
      primitive = null;
      break;
  }
  if (primitive) {
    primitive.deserialize(data);
    this.shape(primitive);
  }
};
acgraph.vector.Clip.prototype.addChild = function(child) {
  child.remove();
  child.setParent(this);
  this.needUpdateClip_();
  return this;
};
acgraph.vector.Clip.prototype.removeChild = function(element) {
  element.setParent(null);
  var dom = element.domElement();
  if (dom) {
    acgraph.getRenderer().removeNode(dom);
  }
  this.needUpdateClip_();
  return element;
};
acgraph.vector.Clip.prototype.getFullTransformation = function() {
  return null;
};
acgraph.vector.Clip.prototype.notifyRemoved = function(child) {
};
acgraph.vector.Clip.prototype.getStage = function() {
  return (this.stage());
};
acgraph.vector.Clip.prototype.setDirtyState = function(value) {
  this.needUpdateClip_();
};
acgraph.vector.Clip.prototype.dispose = function() {
  goog.base(this, "dispose");
};
acgraph.vector.Clip.prototype.disposeInternal = function() {
  if (this.stage_) {
    this.stage_.removeClipFromRender(this);
  }
  acgraph.getRenderer().disposeClip(this);
  this.shape_.dispose();
  delete this.stage_;
  delete this.id_;
  delete this.elements;
  delete this.dirty_;
  delete this.shape_;
  goog.base(this, "disposeInternal");
};
acgraph.vector.Clip.prototype["shape"] = acgraph.vector.Clip.prototype.shape;
acgraph.vector.Clip.prototype["dispose"] = acgraph.vector.Clip.prototype.dispose;
goog.provide("goog.dom.InputType");
goog.dom.InputType = {BUTTON:"button", CHECKBOX:"checkbox", COLOR:"color", DATE:"date", DATETIME:"datetime", DATETIME_LOCAL:"datetime-local", EMAIL:"email", FILE:"file", HIDDEN:"hidden", IMAGE:"image", MENU:"menu", MONTH:"month", NUMBER:"number", PASSWORD:"password", RADIO:"radio", RANGE:"range", RESET:"reset", SEARCH:"search", SELECT_MULTIPLE:"select-multiple", SELECT_ONE:"select-one", SUBMIT:"submit", TEL:"tel", TEXT:"text", TEXTAREA:"textarea", TIME:"time", URL:"url", WEEK:"week"};
goog.provide("goog.net.IframeIo");
goog.provide("goog.net.IframeIo.IncrementalDataEvent");
goog.require("goog.Timer");
goog.require("goog.Uri");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug");
goog.require("goog.dom");
goog.require("goog.dom.InputType");
goog.require("goog.dom.TagName");
goog.require("goog.dom.safe");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.html.uncheckedconversions");
goog.require("goog.json");
goog.require("goog.log");
goog.require("goog.log.Level");
goog.require("goog.net.ErrorCode");
goog.require("goog.net.EventType");
goog.require("goog.reflect");
goog.require("goog.string");
goog.require("goog.string.Const");
goog.require("goog.structs");
goog.require("goog.userAgent");
goog.net.IframeIo = function() {
  goog.net.IframeIo.base(this, "constructor");
  this.name_ = goog.net.IframeIo.getNextName_();
  this.iframesForDisposal_ = [];
  goog.net.IframeIo.instances_[this.name_] = this;
};
goog.inherits(goog.net.IframeIo, goog.events.EventTarget);
goog.net.IframeIo.instances_ = {};
goog.net.IframeIo.FRAME_NAME_PREFIX = "closure_frame";
goog.net.IframeIo.INNER_FRAME_SUFFIX = "_inner";
goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS = 2E3;
goog.net.IframeIo.counter_ = 0;
goog.net.IframeIo.form_;
goog.net.IframeIo.send = function(uri, opt_callback, opt_method, opt_noCache, opt_data) {
  var io = new goog.net.IframeIo;
  goog.events.listen(io, goog.net.EventType.READY, io.dispose, false, io);
  if (opt_callback) {
    goog.events.listen(io, goog.net.EventType.COMPLETE, opt_callback);
  }
  io.send(uri, opt_method, opt_noCache, opt_data);
};
goog.net.IframeIo.getIframeByName = function(fname) {
  return window.frames[fname];
};
goog.net.IframeIo.getInstanceByName = function(fname) {
  return goog.net.IframeIo.instances_[fname];
};
goog.net.IframeIo.handleIncrementalData = function(win, data) {
  var iframeName = goog.string.endsWith(win.name, goog.net.IframeIo.INNER_FRAME_SUFFIX) ? win.parent.name : win.name;
  var iframeIoName = iframeName.substring(0, iframeName.lastIndexOf("_"));
  var iframeIo = goog.net.IframeIo.getInstanceByName(iframeIoName);
  if (iframeIo && iframeName == iframeIo.iframeName_) {
    iframeIo.handleIncrementalData_(data);
  } else {
    var logger = goog.log.getLogger("goog.net.IframeIo");
    goog.log.info(logger, "Incremental iframe data routed for unknown iframe");
  }
};
goog.net.IframeIo.getNextName_ = function() {
  return goog.net.IframeIo.FRAME_NAME_PREFIX + goog.net.IframeIo.counter_++;
};
goog.net.IframeIo.getForm_ = function() {
  if (!goog.net.IframeIo.form_) {
    goog.net.IframeIo.form_ = (goog.dom.createDom(goog.dom.TagName.FORM));
    goog.net.IframeIo.form_.acceptCharset = "utf-8";
    var s = goog.net.IframeIo.form_.style;
    s.position = "absolute";
    s.visibility = "hidden";
    s.top = s.left = "-10px";
    s.width = s.height = "10px";
    s.overflow = "hidden";
    goog.dom.getDocument().body.appendChild(goog.net.IframeIo.form_);
  }
  return goog.net.IframeIo.form_;
};
goog.net.IframeIo.addFormInputs_ = function(form, data) {
  var helper = goog.dom.getDomHelper(form);
  goog.structs.forEach(data, function(value, key) {
    if (!goog.isArray(value)) {
      value = [value];
    }
    goog.array.forEach(value, function(value) {
      var inp = helper.createDom(goog.dom.TagName.INPUT, {"type":goog.dom.InputType.HIDDEN, "name":key, "value":value});
      form.appendChild(inp);
    });
  });
};
goog.net.IframeIo.useIeReadyStateCodePath_ = function() {
  return goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("11");
};
goog.net.IframeIo.prototype.logger_ = goog.log.getLogger("goog.net.IframeIo");
goog.net.IframeIo.prototype.form_ = null;
goog.net.IframeIo.prototype.iframe_ = null;
goog.net.IframeIo.prototype.iframeName_ = null;
goog.net.IframeIo.prototype.nextIframeId_ = 0;
goog.net.IframeIo.prototype.active_ = false;
goog.net.IframeIo.prototype.complete_ = false;
goog.net.IframeIo.prototype.success_ = false;
goog.net.IframeIo.prototype.lastUri_ = null;
goog.net.IframeIo.prototype.lastContent_ = null;
goog.net.IframeIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
goog.net.IframeIo.prototype.firefoxSilentErrorTimeout_ = null;
goog.net.IframeIo.prototype.iframeDisposalTimer_ = null;
goog.net.IframeIo.prototype.errorHandled_;
goog.net.IframeIo.prototype.ignoreResponse_ = false;
goog.net.IframeIo.prototype.errorChecker_;
goog.net.IframeIo.prototype.lastCustomError_;
goog.net.IframeIo.prototype.lastContentHtml_;
goog.net.IframeIo.prototype.send = function(uri, opt_method, opt_noCache, opt_data) {
  if (this.active_) {
    throw Error("[goog.net.IframeIo] Unable to send, already active.");
  }
  var uriObj = new goog.Uri(uri);
  this.lastUri_ = uriObj;
  var method = opt_method ? opt_method.toUpperCase() : "GET";
  if (opt_noCache) {
    uriObj.makeUnique();
  }
  goog.log.info(this.logger_, "Sending iframe request: " + uriObj + " [" + method + "]");
  this.form_ = goog.net.IframeIo.getForm_();
  if (method == "GET") {
    goog.net.IframeIo.addFormInputs_(this.form_, uriObj.getQueryData());
  }
  if (opt_data) {
    goog.net.IframeIo.addFormInputs_(this.form_, opt_data);
  }
  this.form_.action = uriObj.toString();
  this.form_.method = method;
  this.sendFormInternal_();
  this.clearForm_();
};
goog.net.IframeIo.prototype.sendFromForm = function(form, opt_uri, opt_noCache) {
  if (this.active_) {
    throw Error("[goog.net.IframeIo] Unable to send, already active.");
  }
  var uri = new goog.Uri(opt_uri || form.action);
  if (opt_noCache) {
    uri.makeUnique();
  }
  goog.log.info(this.logger_, "Sending iframe request from form: " + uri);
  this.lastUri_ = uri;
  this.form_ = form;
  this.form_.action = uri.toString();
  this.sendFormInternal_();
};
goog.net.IframeIo.prototype.abort = function(opt_failureCode) {
  if (this.active_) {
    goog.log.info(this.logger_, "Request aborted");
    var requestIframe = this.getRequestIframe();
    goog.asserts.assert(requestIframe);
    goog.events.removeAll(requestIframe);
    this.complete_ = false;
    this.active_ = false;
    this.success_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.makeReady_();
  }
};
goog.net.IframeIo.prototype.disposeInternal = function() {
  goog.log.fine(this.logger_, "Disposing iframeIo instance");
  if (this.active_) {
    goog.log.fine(this.logger_, "Aborting active request");
    this.abort();
  }
  goog.net.IframeIo.superClass_.disposeInternal.call(this);
  if (this.iframe_) {
    this.scheduleIframeDisposal_();
  }
  this.disposeForm_();
  delete this.errorChecker_;
  this.form_ = null;
  this.lastCustomError_ = this.lastContent_ = this.lastContentHtml_ = null;
  this.lastUri_ = null;
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  delete goog.net.IframeIo.instances_[this.name_];
};
goog.net.IframeIo.prototype.isComplete = function() {
  return this.complete_;
};
goog.net.IframeIo.prototype.isSuccess = function() {
  return this.success_;
};
goog.net.IframeIo.prototype.isActive = function() {
  return this.active_;
};
goog.net.IframeIo.prototype.getResponseText = function() {
  return this.lastContent_;
};
goog.net.IframeIo.prototype.getResponseHtml = function() {
  return this.lastContentHtml_;
};
goog.net.IframeIo.prototype.getResponseJson = function() {
  return goog.json.parse(this.lastContent_);
};
goog.net.IframeIo.prototype.getResponseXml = function() {
  if (!this.iframe_) {
    return null;
  }
  return this.getContentDocument_();
};
goog.net.IframeIo.prototype.getLastUri = function() {
  return this.lastUri_;
};
goog.net.IframeIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};
goog.net.IframeIo.prototype.getLastError = function() {
  return goog.net.ErrorCode.getDebugMessage(this.lastErrorCode_);
};
goog.net.IframeIo.prototype.getLastCustomError = function() {
  return this.lastCustomError_;
};
goog.net.IframeIo.prototype.setErrorChecker = function(fn) {
  this.errorChecker_ = fn;
};
goog.net.IframeIo.prototype.getErrorChecker = function() {
  return this.errorChecker_;
};
goog.net.IframeIo.prototype.isIgnoringResponse = function() {
  return this.ignoreResponse_;
};
goog.net.IframeIo.prototype.setIgnoreResponse = function(ignore) {
  this.ignoreResponse_ = ignore;
};
goog.net.IframeIo.prototype.sendFormInternal_ = function() {
  this.active_ = true;
  this.complete_ = false;
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.createIframe_();
  if (goog.net.IframeIo.useIeReadyStateCodePath_()) {
    this.form_.target = this.iframeName_ || "";
    this.appendIframe_();
    if (!this.ignoreResponse_) {
      goog.events.listen(this.iframe_, goog.events.EventType.READYSTATECHANGE, this.onIeReadyStateChange_, false, this);
    }
    try {
      this.errorHandled_ = false;
      this.form_.submit();
    } catch (e) {
      if (!this.ignoreResponse_) {
        goog.events.unlisten(this.iframe_, goog.events.EventType.READYSTATECHANGE, this.onIeReadyStateChange_, false, this);
      }
      this.handleError_(goog.net.ErrorCode.ACCESS_DENIED);
    }
  } else {
    goog.log.fine(this.logger_, "Setting up iframes and cloning form");
    this.appendIframe_();
    var innerFrameName = this.iframeName_ + goog.net.IframeIo.INNER_FRAME_SUFFIX;
    var doc = goog.dom.getFrameContentDocument(this.iframe_);
    var html;
    if (document.baseURI) {
      html = goog.net.IframeIo.createIframeHtmlWithBaseUri_(innerFrameName);
    } else {
      html = goog.net.IframeIo.createIframeHtml_(innerFrameName);
    }
    if (goog.userAgent.OPERA && !goog.userAgent.WEBKIT) {
      goog.dom.safe.setInnerHtml(doc.documentElement, html);
    } else {
      goog.dom.safe.documentWrite(doc, html);
    }
    if (!this.ignoreResponse_) {
      goog.events.listen(doc.getElementById(innerFrameName), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
    }
    var textareas = this.form_.getElementsByTagName(goog.dom.TagName.TEXTAREA);
    for (var i = 0, n = textareas.length;i < n;i++) {
      var value = textareas[i].value;
      if (goog.dom.getRawTextContent(textareas[i]) != value) {
        goog.dom.setTextContent(textareas[i], value);
        textareas[i].value = value;
      }
    }
    var clone = doc.importNode(this.form_, true);
    clone.target = innerFrameName;
    clone.action = this.form_.action;
    doc.body.appendChild(clone);
    var selects = this.form_.getElementsByTagName(goog.dom.TagName.SELECT);
    var clones = clone.getElementsByTagName(goog.dom.TagName.SELECT);
    for (var i = 0, n = selects.length;i < n;i++) {
      var selectsOptions = selects[i].getElementsByTagName(goog.dom.TagName.OPTION);
      var clonesOptions = clones[i].getElementsByTagName(goog.dom.TagName.OPTION);
      for (var j = 0, m = selectsOptions.length;j < m;j++) {
        clonesOptions[j].selected = selectsOptions[j].selected;
      }
    }
    var inputs = this.form_.getElementsByTagName(goog.dom.TagName.INPUT);
    var inputClones = clone.getElementsByTagName(goog.dom.TagName.INPUT);
    for (var i = 0, n = inputs.length;i < n;i++) {
      if (inputs[i].type == goog.dom.InputType.FILE) {
        if (inputs[i].value != inputClones[i].value) {
          goog.log.fine(this.logger_, "File input value not cloned properly.  Will " + "submit using original form.");
          this.form_.target = innerFrameName;
          clone = this.form_;
          break;
        }
      }
    }
    goog.log.fine(this.logger_, "Submitting form");
    try {
      this.errorHandled_ = false;
      clone.submit();
      doc.close();
      if (goog.userAgent.GECKO) {
        this.firefoxSilentErrorTimeout_ = goog.Timer.callOnce(this.testForFirefoxSilentError_, 250, this);
      }
    } catch (e$3) {
      goog.log.error(this.logger_, "Error when submitting form: " + goog.debug.exposeException(e$3));
      if (!this.ignoreResponse_) {
        goog.events.unlisten(doc.getElementById(innerFrameName), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
      }
      doc.close();
      this.handleError_(goog.net.ErrorCode.FILE_NOT_FOUND);
    }
  }
};
goog.net.IframeIo.createIframeHtml_ = function(innerFrameName) {
  var innerFrameNameEscaped = goog.string.htmlEscape(innerFrameName);
  return goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract(goog.string.Const.from("Short HTML snippet, input escaped, for performance"), '<body><iframe id="' + innerFrameNameEscaped + '" name="' + innerFrameNameEscaped + '"></iframe>');
};
goog.net.IframeIo.createIframeHtmlWithBaseUri_ = function(innerFrameName) {
  var innerFrameNameEscaped = goog.string.htmlEscape(innerFrameName);
  return goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract(goog.string.Const.from("Short HTML snippet, input escaped, safe URL, for performance"), '<head><base href="' + goog.string.htmlEscape((document.baseURI)) + '"></head>' + '<body><iframe id="' + innerFrameNameEscaped + '" name="' + innerFrameNameEscaped + '"></iframe>');
};
goog.net.IframeIo.prototype.onIeReadyStateChange_ = function(e) {
  if (this.iframe_.readyState == "complete") {
    goog.events.unlisten(this.iframe_, goog.events.EventType.READYSTATECHANGE, this.onIeReadyStateChange_, false, this);
    var doc;
    try {
      doc = goog.dom.getFrameContentDocument(this.iframe_);
      if (goog.userAgent.IE && doc.location == "about:blank" && !navigator.onLine) {
        this.handleError_(goog.net.ErrorCode.OFFLINE);
        return;
      }
    } catch (ex) {
      this.handleError_(goog.net.ErrorCode.ACCESS_DENIED);
      return;
    }
    this.handleLoad_((doc));
  }
};
goog.net.IframeIo.prototype.onIframeLoaded_ = function(e) {
  if (goog.userAgent.OPERA && !goog.userAgent.WEBKIT && this.getContentDocument_().location == "about:blank") {
    return;
  }
  goog.events.unlisten(this.getRequestIframe(), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
  try {
    this.handleLoad_(this.getContentDocument_());
  } catch (ex) {
    this.handleError_(goog.net.ErrorCode.ACCESS_DENIED);
  }
};
goog.net.IframeIo.prototype.handleLoad_ = function(contentDocument) {
  goog.log.fine(this.logger_, "Iframe loaded");
  this.complete_ = true;
  this.active_ = false;
  var errorCode;
  try {
    var body = contentDocument.body;
    this.lastContent_ = body.textContent || body.innerText;
    this.lastContentHtml_ = body.innerHTML;
  } catch (ex) {
    errorCode = goog.net.ErrorCode.ACCESS_DENIED;
  }
  var customError;
  if (!errorCode && typeof this.errorChecker_ == "function") {
    customError = this.errorChecker_(contentDocument);
    if (customError) {
      errorCode = goog.net.ErrorCode.CUSTOM_ERROR;
    }
  }
  goog.log.log(this.logger_, goog.log.Level.FINER, "Last content: " + this.lastContent_);
  goog.log.log(this.logger_, goog.log.Level.FINER, "Last uri: " + this.lastUri_);
  if (errorCode) {
    goog.log.fine(this.logger_, "Load event occurred but failed");
    this.handleError_(errorCode, customError);
  } else {
    goog.log.fine(this.logger_, "Load succeeded");
    this.success_ = true;
    this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.SUCCESS);
    this.makeReady_();
  }
};
goog.net.IframeIo.prototype.handleError_ = function(errorCode, opt_customError) {
  if (!this.errorHandled_) {
    this.success_ = false;
    this.active_ = false;
    this.complete_ = true;
    this.lastErrorCode_ = errorCode;
    if (errorCode == goog.net.ErrorCode.CUSTOM_ERROR) {
      goog.asserts.assert(goog.isDef(opt_customError));
      this.lastCustomError_ = opt_customError;
    }
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR);
    this.makeReady_();
    this.errorHandled_ = true;
  }
};
goog.net.IframeIo.prototype.handleIncrementalData_ = function(data) {
  this.dispatchEvent(new goog.net.IframeIo.IncrementalDataEvent(data));
};
goog.net.IframeIo.prototype.makeReady_ = function() {
  goog.log.info(this.logger_, "Ready for new requests");
  this.scheduleIframeDisposal_();
  this.disposeForm_();
  this.dispatchEvent(goog.net.EventType.READY);
};
goog.net.IframeIo.prototype.createIframe_ = function() {
  goog.log.fine(this.logger_, "Creating iframe");
  this.iframeName_ = this.name_ + "_" + (this.nextIframeId_++).toString(36);
  var iframeAttributes = {"name":this.iframeName_, "id":this.iframeName_};
  if (goog.userAgent.IE && Number(goog.userAgent.VERSION) < 7) {
    iframeAttributes.src = 'javascript:""';
  }
  this.iframe_ = (goog.dom.getDomHelper(this.form_).createDom(goog.dom.TagName.IFRAME, iframeAttributes));
  var s = this.iframe_.style;
  s.visibility = "hidden";
  s.width = s.height = "10px";
  s.display = "none";
  if (!goog.userAgent.WEBKIT) {
    s.position = "absolute";
    s.top = s.left = "-10px";
  } else {
    s.marginTop = s.marginLeft = "-10px";
  }
};
goog.net.IframeIo.prototype.appendIframe_ = function() {
  goog.dom.getDomHelper(this.form_).getDocument().body.appendChild(this.iframe_);
};
goog.net.IframeIo.prototype.scheduleIframeDisposal_ = function() {
  var iframe = this.iframe_;
  if (iframe) {
    iframe.onreadystatechange = null;
    iframe.onload = null;
    iframe.onerror = null;
    this.iframesForDisposal_.push(iframe);
  }
  if (this.iframeDisposalTimer_) {
    goog.Timer.clear(this.iframeDisposalTimer_);
    this.iframeDisposalTimer_ = null;
  }
  if (goog.userAgent.GECKO || goog.userAgent.OPERA && !goog.userAgent.WEBKIT) {
    this.iframeDisposalTimer_ = goog.Timer.callOnce(this.disposeIframes_, goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS, this);
  } else {
    this.disposeIframes_();
  }
  this.iframe_ = null;
  this.iframeName_ = null;
};
goog.net.IframeIo.prototype.disposeIframes_ = function() {
  if (this.iframeDisposalTimer_) {
    goog.Timer.clear(this.iframeDisposalTimer_);
    this.iframeDisposalTimer_ = null;
  }
  while (this.iframesForDisposal_.length != 0) {
    var iframe = this.iframesForDisposal_.pop();
    goog.log.info(this.logger_, "Disposing iframe");
    goog.dom.removeNode(iframe);
  }
};
goog.net.IframeIo.prototype.clearForm_ = function() {
  if (this.form_ && this.form_ == goog.net.IframeIo.form_) {
    goog.dom.removeChildren(this.form_);
  }
};
goog.net.IframeIo.prototype.disposeForm_ = function() {
  this.clearForm_();
  this.form_ = null;
};
goog.net.IframeIo.prototype.getContentDocument_ = function() {
  if (this.iframe_) {
    return (goog.dom.getFrameContentDocument(this.getRequestIframe()));
  }
  return null;
};
goog.net.IframeIo.prototype.getRequestIframe = function() {
  if (this.iframe_) {
    return (goog.net.IframeIo.useIeReadyStateCodePath_() ? this.iframe_ : goog.dom.getFrameContentDocument(this.iframe_).getElementById(this.iframeName_ + goog.net.IframeIo.INNER_FRAME_SUFFIX));
  }
  return null;
};
goog.net.IframeIo.prototype.testForFirefoxSilentError_ = function() {
  if (this.active_) {
    var doc = this.getContentDocument_();
    if (doc && !goog.reflect.canAccessProperty(doc, "documentUri")) {
      if (!this.ignoreResponse_) {
        goog.events.unlisten(this.getRequestIframe(), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
      }
      if (navigator.onLine) {
        goog.log.warning(this.logger_, "Silent Firefox error detected");
        this.handleError_(goog.net.ErrorCode.FF_SILENT_ERROR);
      } else {
        goog.log.warning(this.logger_, "Firefox is offline so report offline error " + "instead of silent error");
        this.handleError_(goog.net.ErrorCode.OFFLINE);
      }
      return;
    }
    this.firefoxSilentErrorTimeout_ = goog.Timer.callOnce(this.testForFirefoxSilentError_, 250, this);
  }
};
goog.net.IframeIo.IncrementalDataEvent = function(data) {
  goog.events.Event.call(this, goog.net.EventType.INCREMENTAL_DATA);
  this.data = data;
};
goog.inherits(goog.net.IframeIo.IncrementalDataEvent, goog.events.Event);
goog.provide("acgraph.utils.HelperElement");
goog.provide("acgraph.utils.HelperElement.EventType");
goog.require("acgraph.events");
goog.require("goog.dom");
goog.require("goog.events.EventTarget");
goog.require("goog.net.IframeIo");
goog.require("goog.style");
goog.require("goog.userAgent");
acgraph.utils.HelperElement = function(stage, container) {
  goog.base(this);
  this.stage_ = stage;
  this.sizeElement_ = goog.dom.getDomHelper().createDom("iframe", {"style":"position:absolute; width:10%; height:10%; top: -99em; border-style:none; overflow:none;", "frameborder":"0", "tabIndex":-1, "aria-hidden":"true"});
  this.handler_ = goog.bind(this.handleResize_, this);
  this.renderToContainer(container);
};
goog.inherits(acgraph.utils.HelperElement, goog.events.EventTarget);
acgraph.utils.HelperElement.EventType = {SIZECHANGE:"sizechange"};
acgraph.utils.HelperElement.prototype.renderToContainer = function(value) {
  if (!value) {
    return;
  }
  this.container_ = value;
  value.insertBefore(this.sizeElement_, value.firstChild);
  if (this.resizeTarget_) {
    goog.events.unlisten(this.resizeTarget_, goog.events.EventType.RESIZE, this.handleResize_, false, this);
  }
  if (this.resizeChecker_) {
    clearInterval(this.resizeChecker_);
  }
  var resizeTarget;
  try {
    resizeTarget = goog.dom.getFrameContentWindow((this.sizeElement_));
    this.resizeTarget_ = resizeTarget;
  } catch (ignore) {
  }
  if (resizeTarget) {
    if (goog.userAgent.GECKO) {
      var doc = resizeTarget.document;
      doc.open();
      doc.close();
    }
    acgraph.events.listen(resizeTarget, goog.events.EventType.RESIZE, this.handleResize_, false, this);
  }
  this.resizeChecker_ = setInterval(this.handler_, 200);
};
acgraph.utils.HelperElement.prototype.sendRequestToExportServer = function(url, opt_arguments) {
  goog.net.IframeIo.send(url, undefined, "POST", false, opt_arguments);
};
acgraph.utils.HelperElement.prototype.domElement = function() {
  return this.sizeElement_;
};
acgraph.utils.HelperElement.prototype.disposeInternal = function() {
  goog.events.unlisten(this.resizeTarget_, goog.events.EventType.RESIZE, this.handleResize_, false, this);
  if (!goog.userAgent.GECKO || goog.userAgent.isVersionOrHigher("1.9")) {
  }
  goog.dom.removeNode(this.sizeElement_);
  delete this.sizeElement_;
  delete this.container_;
  delete this.stage_;
  goog.base(this, "disposeInternal");
};
acgraph.utils.HelperElement.prototype.handleResize_ = function(e) {
  if (this.isDisposed()) {
    return;
  }
  var dispatchResize = false;
  var size = goog.style.getContentBoxSize(this.container_);
  var currentWidth = size.width || 0;
  var currentHeight = size.height || 0;
  if (this.stage_.lastContainerWidth != currentWidth || this.stage_.lastContainerHeight != currentHeight) {
    var isHidden = goog.style.getComputedStyle(this.container_, "display") == "none";
    var parent;
    var element = this.container_;
    while (!isHidden && (parent = goog.dom.getParentElement(element))) {
      isHidden = isHidden || goog.style.getComputedStyle(parent, "display") == "none";
      element = parent;
    }
    if (!isHidden) {
      if (this.stage_.lastContainerWidth != currentWidth) {
        dispatchResize = true;
      }
      if (this.stage_.lastContainerHeight != currentHeight) {
        dispatchResize = true;
      }
    }
  }
  if (dispatchResize) {
    this.dispatchEvent(acgraph.utils.HelperElement.EventType.SIZECHANGE);
  }
};
goog.provide("acgraph.vector.Stage");
goog.require("acgraph.error");
goog.require("acgraph.events.BrowserEvent");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.HelperElement");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.utils.exporting");
goog.require("acgraph.vector.Circle");
goog.require("acgraph.vector.Clip");
goog.require("acgraph.vector.Defs");
goog.require("acgraph.vector.Ellipse");
goog.require("acgraph.vector.HatchFill");
goog.require("acgraph.vector.ILayer");
goog.require("acgraph.vector.Image");
goog.require("acgraph.vector.Layer");
goog.require("acgraph.vector.Path");
goog.require("acgraph.vector.PatternFill");
goog.require("acgraph.vector.Rect");
goog.require("acgraph.vector.Text");
goog.require("acgraph.vector.UnmanagedLayer");
goog.require("goog.Uri.QueryData");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.events.Listenable");
goog.require("goog.net.XhrIo");
goog.require("goog.structs.Map");
goog.require("goog.style");
acgraph.vector.Stage = function(opt_container, opt_width, opt_height) {
  goog.base(this);
  this.suspended_ = 1;
  this.container_ = null;
  this.originContainer_ = null;
  this.titleElement_ = null;
  this.titleVal_ = void 0;
  this.descElement_ = null;
  this.descVal_ = void 0;
  this.asyncMode_ = false;
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eventHandler_);
  var domElement = this.createDomElement();
  if (!domElement) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.STAGE_SHOULD_HAVE_DOM_ELEMENT);
  }
  this.width(opt_width || "100%");
  this.height(opt_height || "100%");
  this.container(opt_container);
  this.domElement_ = domElement;
  acgraph.register(this);
  this.createInternal();
  this.clipsToRender_ = [];
  this.renderAsync_ = goog.bind(function() {
    this.currentDomChangesCount = 0;
    this.acquireDomChanges = this.acquireDomChangesAsync_;
    this.renderInternal();
    if (!goog.dom.getParentElement(this.domElement()) || this.container() != goog.dom.getParentElement(this.domElement())) {
      acgraph.getRenderer().appendChild((this.container()), this.domElement());
    }
    if (this.isDirty()) {
      setTimeout(this.renderAsync_, 0);
    } else {
      if (goog.events.hasListener(this, acgraph.vector.Stage.EventType.STAGE_RESIZE, false) || goog.events.hasListener(this, acgraph.vector.Stage.EventType.STAGE_RESIZE, true)) {
        this.startResizeMonitor();
      }
      this.dispatchRenderEvent(acgraph.vector.Stage.EventType.RENDER_FINISH);
      var imageLoader = acgraph.getRenderer().getImageLoader();
      var isImageLoading = acgraph.getRenderer().isImageLoading();
      if (imageLoader && isImageLoading) {
        if (!this.imageLoadingListener_) {
          this.imageLoadingListener_ = goog.events.listenOnce(imageLoader, goog.net.EventType.COMPLETE, function(e) {
            this.stageRenderedDispatcher_.call();
            this.imageLoadingListener_ = null;
          }, false, this);
        }
      } else {
        this.stageRenderedDispatcher_.call();
      }
    }
  }, this);
  this.stageRenderedDispatcher_ = goog.bind(function() {
    if (!this.isRendering_) {
      this.dispatchEvent(acgraph.vector.Stage.EventType.STAGE_RENDERED);
    }
  }, this);
  this.defs_ = this.createDefs();
  this.defs_.createDom();
  acgraph.getRenderer().appendChild(this.domElement(), this.defs_.domElement());
  this.rootLayer_ = new acgraph.vector.Layer;
  this.rootLayer_.setParent(this).render();
  acgraph.getRenderer().appendChild(this.domElement(), this.rootLayer_.domElement());
  this.eventHandler_.listen(this.domElement(), [goog.events.EventType.MOUSEDOWN, goog.events.EventType.MOUSEOVER, goog.events.EventType.MOUSEOUT, goog.events.EventType.CLICK, goog.events.EventType.DBLCLICK, goog.events.EventType.TOUCHSTART, goog.events.EventType.TOUCHEND, goog.events.EventType.TOUCHCANCEL, goog.events.EventType.MSPOINTERDOWN, goog.events.EventType.MSPOINTERUP, goog.events.EventType.POINTERDOWN, goog.events.EventType.POINTERUP, goog.events.EventType.CONTEXTMENU], this.handleMouseEvent_, 
  false);
  this.resume();
};
goog.inherits(acgraph.vector.Stage, goog.events.EventTarget);
acgraph.vector.Stage.Error = {CONTAINER_SHOULD_BE_DEFINED:"Container to render stage should be defined", STAGE_SHOULD_HAVE_DOM_ELEMENT:"Stage should have dom element", IN_RENDERING_PROCESS:"Stage already in rendering process"};
acgraph.vector.Stage.DomChangeType = {ELEMENT_CREATE:1, ELEMENT_ADD:2, ELEMENT_REMOVE:3, APPLY_FILL:4, APPLY_STROKE:5};
acgraph.vector.Stage.EventType = {RENDER_START:"renderstart", RENDER_FINISH:"renderfinish", STAGE_RESIZE:"stageresize", STAGE_RENDERED:"stagerendered"};
acgraph.vector.Stage.HANDLED_EVENT_TYPES_CAPTURE_SHIFT = 12;
acgraph.vector.Stage.prototype.handleMouseEvent_ = function(e) {
  var event = new acgraph.events.BrowserEvent(e, this);
  if (event["target"] instanceof acgraph.vector.Element) {
    var el = (event["target"]);
    el.dispatchEvent(event);
    if (event.defaultPrevented) {
      e.preventDefault();
    }
    if (!(event["relatedTarget"] instanceof acgraph.vector.Element) || (event["relatedTarget"]).getStage() != this) {
      if (event["type"] == acgraph.events.EventType.MOUSEOVER) {
        this.eventHandler_.listen(goog.dom.getDocument(), acgraph.events.EventType.MOUSEMOVE, this.handleMouseEvent_, false);
      } else {
        if (event["type"] == acgraph.events.EventType.MOUSEOUT) {
          this.eventHandler_.unlisten(goog.dom.getDocument(), acgraph.events.EventType.MOUSEMOVE, this.handleMouseEvent_, false);
        }
      }
    }
    if (event["type"] == acgraph.events.EventType.MOUSEDOWN) {
      this.eventHandler_.listen(goog.dom.getDocument(), acgraph.events.EventType.MOUSEUP, this.handleMouseEvent_, false);
    } else {
      if (event["type"] == acgraph.events.EventType.MOUSEUP) {
        this.eventHandler_.unlisten(goog.dom.getDocument(), acgraph.events.EventType.MOUSEUP, this.handleMouseEvent_, false);
      } else {
        if (event["type"] == acgraph.events.EventType.TOUCHSTART) {
          this.eventHandler_.listen(goog.dom.getDocument(), acgraph.events.EventType.TOUCHMOVE, this.handleMouseEvent_, false);
        } else {
          if (event["type"] == acgraph.events.EventType.TOUCHEND) {
            this.eventHandler_.unlisten(goog.dom.getDocument(), acgraph.events.EventType.TOUCHMOVE, this.handleMouseEvent_, false);
          } else {
            if (event["type"] == goog.events.EventType.POINTERDOWN) {
              this.eventHandler_.listen(goog.dom.getDocument(), goog.events.EventType.POINTERMOVE, this.handleMouseEvent_, false);
            } else {
              if (event["type"] == goog.events.EventType.POINTERUP) {
                this.eventHandler_.unlisten(goog.dom.getDocument(), goog.events.EventType.POINTERMOVE, this.handleMouseEvent_, false);
              }
            }
          }
        }
      }
    }
  }
};
acgraph.vector.Stage.prototype.width_ = 0;
acgraph.vector.Stage.prototype.height_ = 0;
acgraph.vector.Stage.prototype.originalWidth = 0;
acgraph.vector.Stage.prototype.originalHeight = 0;
acgraph.vector.Stage.prototype.isPercentWidth = false;
acgraph.vector.Stage.prototype.isPercentHeight = false;
acgraph.vector.Stage.prototype.currentDomChangesCount = 0;
acgraph.vector.Stage.prototype.maxDomChanges = 500;
acgraph.vector.Stage.prototype["pathToRadialGradientImage"] = "RadialGradient.png";
acgraph.vector.Stage.prototype.id_ = undefined;
acgraph.vector.Stage.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.STAGE;
};
acgraph.vector.Stage.prototype.domElement = function() {
  return this.domElement_;
};
acgraph.vector.Stage.prototype.getRootLayer = function() {
  return this.rootLayer_;
};
acgraph.vector.Stage.prototype.width = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.originalWidth = opt_value;
    if (this.container_) {
      goog.style.setWidth(this.container_, this.originalWidth);
    }
    this.isPercentWidth = goog.isString(opt_value) && goog.string.endsWith(opt_value, "%");
    var containerWidth = this.container_ ? goog.style.getContentBoxSize(this.container_).width || 0 : 0;
    if (this.isPercentWidth) {
      if (this.container_) {
        this.setWidthInternal(Math.max(containerWidth, 0), containerWidth);
        this.startResizeMonitor();
      } else {
        this.setWidthInternal(0, containerWidth);
      }
    } else {
      this.setWidthInternal(parseFloat(opt_value.toString()), containerWidth);
    }
    this.needUpdateSize_ = true;
    if (!this.suspended_ && this.container_) {
      this.render();
      this.dispatchEvent(acgraph.vector.Stage.EventType.STAGE_RESIZE);
    }
    return this;
  }
  return this.width_;
};
acgraph.vector.Stage.prototype.setWidthInternal = function(width, containerWidth) {
  this.width_ = Math.max(width, 0);
  this.lastContainerWidth = containerWidth;
};
acgraph.vector.Stage.prototype.height = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.originalHeight = opt_value;
    if (this.container_) {
      goog.style.setHeight(this.container_, this.originalHeight);
    }
    this.isPercentHeight = goog.isString(opt_value) && goog.string.endsWith(opt_value, "%");
    var containerHeight = this.container_ ? goog.style.getContentBoxSize(this.container_).height || 0 : 0;
    if (this.isPercentHeight) {
      if (this.container_) {
        this.setHeightInternal(Math.max(containerHeight, 0), containerHeight);
        this.startResizeMonitor();
      } else {
        this.setHeightInternal(0, containerHeight);
      }
    } else {
      this.setHeightInternal(parseFloat(opt_value.toString()), containerHeight);
    }
    this.needUpdateSize_ = true;
    if (!this.suspended_ && this.container()) {
      this.render();
      this.dispatchEvent(acgraph.vector.Stage.EventType.STAGE_RESIZE);
    }
    return this;
  }
  return this.height_;
};
acgraph.vector.Stage.prototype.setHeightInternal = function(height, containerHeight) {
  this.height_ = Math.max(height, 0);
  this.lastContainerHeight = containerHeight;
};
acgraph.vector.Stage.prototype.container = function(opt_value) {
  if (!goog.isDef(opt_value)) {
    return this.container_;
  }
  this.originContainer_ = goog.dom.getElement(opt_value || null);
  if (this.originContainer_) {
    if (!this.container_) {
      this.container_ = goog.dom.createDom(goog.dom.TagName.DIV, {style:"position: relative; left: 0; top: 0; overflow: hidden;"});
    }
    goog.style.setWidth(this.container_, this.originalWidth);
    goog.style.setHeight(this.container_, this.originalHeight);
    goog.dom.appendChild(this.originContainer_, this.container_);
    if (this.isPercentHeight || this.isPercentWidth) {
      this.startResizeMonitor();
    }
    var size = goog.style.getContentBoxSize(this.container_);
    var containerHeight = size.height || 0;
    var containerWidth = size.width || 0;
    if (this.isPercentHeight) {
      this.setHeightInternal(Math.max(containerHeight, 0), containerHeight);
    } else {
      this.lastContainerHeight = containerHeight;
    }
    if (this.isPercentWidth) {
      this.setWidthInternal(Math.max(containerWidth, 0), containerWidth);
    } else {
      this.lastContainerWidth = containerWidth;
    }
  } else {
    this.container_ = null;
  }
  if (this.isPercentHeight || this.isPercentWidth) {
    this.needUpdateSize_ = true;
  }
  if (!this.isSuspended() && this.container_) {
    this.render();
  }
  return this;
};
acgraph.vector.Stage.prototype.helperElement_ = null;
acgraph.vector.Stage.prototype.getHelperElement = function() {
  if (!this.helperElement_) {
    if (this.originContainer_) {
      this.helperElement_ = new acgraph.utils.HelperElement(this, (this.originContainer_));
      this.registerDisposable(this.helperElement_);
    } else {
      return null;
    }
  }
  return this.helperElement_;
};
acgraph.vector.Stage.prototype.eventHandler_ = null;
acgraph.vector.Stage.prototype.isRendering_ = false;
acgraph.vector.Stage.prototype.suspend = function() {
  this.suspended_++;
  return this;
};
acgraph.vector.Stage.prototype.resume = function(opt_force) {
  this.suspended_ = opt_force ? 0 : Math.max(this.suspended_ - 1, 0);
  if (!this.suspended_ && this.container()) {
    if (this.asyncMode_) {
      this.renderAsync();
    } else {
      this.render();
    }
  }
  return this;
};
acgraph.vector.Stage.prototype.asyncMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.asyncMode_ = !!opt_value;
    return this;
  }
  return this.asyncMode_;
};
acgraph.vector.Stage.prototype.isSuspended = function() {
  return !!this.suspended_;
};
acgraph.vector.Stage.prototype.isRendering = function() {
  return this.isRendering_;
};
acgraph.vector.Stage.prototype.dispatchRenderEvent = function(type) {
  switch(type) {
    case acgraph.vector.Stage.EventType.RENDER_START:
      this.isRendering_ = true;
      break;
    case acgraph.vector.Stage.EventType.RENDER_FINISH:
      this.isRendering_ = false;
      break;
  }
  this.dispatchEvent(type);
};
acgraph.vector.Stage.prototype.handleResizeEvent = function() {
  this.updateSizeFromContainer();
};
acgraph.vector.Stage.prototype.updateSizeFromContainer = function() {
  if (this.container_) {
    var size = goog.style.getContentBoxSize(this.container_);
    var containerHeight = size.height || 0;
    var needsDispatch = false;
    if (this.lastContainerHeight != containerHeight) {
      if (this.isPercentHeight) {
        this.setHeightInternal(containerHeight * parseFloat(this.originalHeight) / 100, containerHeight);
        needsDispatch = true;
      } else {
        this.lastContainerHeight = containerHeight;
      }
    }
    var containerWidth = size.width || 0;
    if (this.lastContainerWidth != containerWidth) {
      if (this.isPercentWidth) {
        this.setWidthInternal(containerWidth * parseFloat(this.originalWidth) / 100, containerWidth);
        needsDispatch = true;
      } else {
        this.lastContainerWidth = containerWidth;
      }
    }
    if (needsDispatch) {
      this.dispatchEvent(acgraph.vector.Stage.EventType.STAGE_RESIZE);
    }
  }
};
acgraph.vector.Stage.prototype.resize = function(width, height) {
  this.width(width);
  this.height(height);
};
acgraph.vector.Stage.prototype.startResizeMonitor = function() {
  var helperElement = this.getHelperElement();
  var domElement = helperElement.domElement();
  if (this.originContainer_ != goog.dom.getParentElement(domElement)) {
    helperElement.renderToContainer((this.originContainer_));
  }
  this.eventHandler_.listen(helperElement, acgraph.utils.HelperElement.EventType.SIZECHANGE, this.handleResizeEvent, false);
};
acgraph.vector.Stage.prototype.createDefs = goog.abstractMethod;
acgraph.vector.Stage.prototype.getStage = function() {
  return this;
};
acgraph.vector.Stage.prototype.parent = function() {
  return this;
};
acgraph.vector.Stage.prototype.getDefs = function() {
  return this.defs_;
};
acgraph.vector.Stage.prototype.clearDefs = function() {
  this.defs_.clear();
};
acgraph.vector.Stage.prototype.createDomElement = function() {
  return acgraph.getRenderer().createStageElement();
};
acgraph.vector.Stage.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var id = opt_value || "";
    if (this.id_ !== id) {
      this.id_ = id;
      acgraph.getRenderer().setId(this, this.id_);
    }
    return this;
  }
  if (!goog.isDef(this.id_)) {
    this.id(acgraph.utils.IdGenerator.getInstance().generateId(this));
  }
  return (this.id_);
};
acgraph.vector.Stage.prototype.createInternal = function() {
  acgraph.getRenderer().setStageSize(this.domElement(), "100%", "100%");
};
acgraph.vector.Stage.prototype.acquireDomChangesSync_ = function(wantedCount) {
  this.currentDomChangesCount += wantedCount;
  return wantedCount;
};
acgraph.vector.Stage.prototype.acquireDomChangesAsync_ = function(wantedCount) {
  var allowed = Math.min(this.maxDomChanges - this.currentDomChangesCount, wantedCount);
  this.currentDomChangesCount += allowed;
  return allowed;
};
acgraph.vector.Stage.prototype.acquireDomChanges = acgraph.vector.Stage.prototype.acquireDomChangesSync_;
acgraph.vector.Stage.prototype.acquireDomChange = function(changeType) {
  if (changeType == acgraph.vector.Stage.DomChangeType.ELEMENT_CREATE || changeType == acgraph.vector.Stage.DomChangeType.ELEMENT_ADD || changeType == acgraph.vector.Stage.DomChangeType.ELEMENT_REMOVE) {
    return this.acquireDomChanges(1) > 0;
  }
  return true;
};
acgraph.vector.Stage.prototype.blockChangesForAdding = function() {
  var wanted = Math.floor(Math.max(this.maxDomChanges - this.currentDomChangesCount, 0) / 3);
  return this.acquireDomChanges(wanted);
};
acgraph.vector.Stage.prototype.releaseDomChanges = function(allowed, made) {
  this.currentDomChangesCount -= allowed - made;
};
acgraph.vector.Stage.prototype.render = function() {
  if (this.isRendering_) {
    return this;
  }
  this.currentDomChangesCount = 0;
  this.acquireDomChanges = this.acquireDomChangesSync_;
  this.dispatchRenderEvent(acgraph.vector.Stage.EventType.RENDER_START);
  if (!this.container_) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.CONTAINER_SHOULD_BE_DEFINED);
  }
  this.renderInternal();
  if (!goog.dom.getParentElement(this.domElement_) || this.container_ != goog.dom.getParentElement(this.domElement_)) {
    goog.dom.appendChild(this.container_, this.domElement_);
    goog.style.setStyle(this.domElement_, "display", "block");
    goog.dom.classlist.add(this.domElement_, "anychart-ui-support");
  }
  if (this.isDirty()) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.DIRTY_AFTER_SYNC_RENDER);
  }
  if (!this.renderedResizeMonitor_ && (goog.events.hasListener(this, acgraph.vector.Stage.EventType.STAGE_RESIZE, false) || goog.events.hasListener(this, acgraph.vector.Stage.EventType.STAGE_RESIZE, true))) {
    this.startResizeMonitor();
    this.renderedResizeMonitor_ = true;
  }
  this.dispatchRenderEvent(acgraph.vector.Stage.EventType.RENDER_FINISH);
  var imageLoader = acgraph.getRenderer().getImageLoader();
  var isImageLoading = acgraph.getRenderer().isImageLoading();
  if (imageLoader && isImageLoading) {
    if (!this.imageLoadingListener_) {
      this.imageLoadingListener_ = goog.events.listenOnce(imageLoader, goog.net.EventType.COMPLETE, function(e) {
        this.stageRenderedDispatcher_.call();
        this.imageLoadingListener_ = null;
      }, false, this);
    }
  } else {
    this.stageRenderedDispatcher_.call();
  }
  return this;
};
acgraph.vector.Stage.prototype.renderInternal = function() {
  if (this.clipsToRender_ && this.clipsToRender_.length) {
    for (var i = 0;i < this.clipsToRender_.length;i++) {
      var clip = this.clipsToRender_[i];
      if (clip.isDirty()) {
        clip.render();
      }
    }
    this.clipsToRender_.length = 0;
  }
  if (this.rootLayer_.isDirty()) {
    this.rootLayer_.render();
  }
  if (this.credits) {
    this.credits().render();
  }
};
acgraph.vector.Stage.prototype.renderAsync = function() {
  if (!this.isRendering_) {
    if (!this.container()) {
      throw acgraph.error.getErrorMessage(acgraph.error.Code.CONTAINER_SHOULD_BE_DEFINED);
    }
    this.dispatchRenderEvent(acgraph.vector.Stage.EventType.RENDER_START);
    setTimeout(this.renderAsync_, 0);
  }
  return this;
};
acgraph.vector.Stage.prototype.setDirtyState = function(state) {
};
acgraph.vector.Stage.prototype.isDirty = function() {
  return this.rootLayer_.isDirty();
};
acgraph.vector.Stage.prototype.hasDirtyState = function(state) {
  return this.rootLayer_.hasDirtyState(state);
};
acgraph.vector.Stage.prototype.visible = function(opt_isVisible) {
  if (arguments.length == 0) {
    return (this.rootLayer_.visible());
  }
  this.rootLayer_.visible(opt_isVisible);
  return this;
};
acgraph.vector.Stage.prototype.data = function(opt_value) {
  if (arguments.length == 0) {
    return this.serialize();
  } else {
    var primitive;
    var type = opt_value["type"];
    if (!type) {
      this.deserialize(opt_value);
    } else {
      switch(type) {
        case "rect":
          primitive = this.rect();
          break;
        case "circle":
          primitive = this.circle();
          break;
        case "ellipse":
          primitive = this.ellipse();
          break;
        case "image":
          primitive = this.image();
          break;
        case "text":
          primitive = this.text();
          break;
        case "path":
          primitive = this.path();
          break;
        case "layer":
          primitive = this.layer();
          break;
        default:
          primitive = null;
          break;
      }
    }
    if (primitive) {
      primitive.deserialize(opt_value);
    }
    return this;
  }
};
acgraph.vector.Stage.ExportType = {SVG:"svg", JPG:"jpg", PNG:"png", PDF:"pdf"};
acgraph.vector.Stage.prototype.shareUrl_ = function(type, data, asBase64, saveAndShare, onSuccess, opt_onError) {
  if (asBase64) {
    data["responseType"] = "base64";
  }
  if (saveAndShare) {
    data["save"] = true;
  }
  var onError = opt_onError || goog.nullFunction;
  var property = saveAndShare ? "url" : "result";
  var callback = function(event) {
    var xhr = (event.target);
    if (xhr.isSuccess()) {
      onSuccess((xhr.getResponseJson()[property]));
    } else {
      onError(xhr.getLastError());
    }
  };
  data = goog.Uri.QueryData.createFromMap(new goog.structs.Map(data));
  goog.net.XhrIo.send(acgraph.exportServer + "/" + type, callback, "POST", data.toString());
};
acgraph.vector.Stage.prototype.addPngData_ = function(data, opt_width, opt_height, opt_quality, opt_filename) {
  data["data"] = this.toSvg();
  data["dataType"] = "svg";
  data["responseType"] = "file";
  if (goog.isDef(opt_width)) {
    data["width"] = opt_width;
  }
  if (goog.isDef(opt_height)) {
    data["height"] = opt_height;
  }
  if (goog.isDef(opt_quality)) {
    data["quality"] = opt_quality;
  }
  if (goog.isDef(opt_filename)) {
    data["file-name"] = opt_filename;
  }
};
acgraph.vector.Stage.prototype.shareAsPng = function(onSuccess, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPngData_(data, opt_width, opt_height, opt_quality, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PNG, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.addJpgData_ = function(data, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  data["data"] = this.toSvg();
  data["dataType"] = "svg";
  data["responseType"] = "file";
  if (goog.isDef(opt_width)) {
    data["width"] = opt_width;
  }
  if (goog.isDef(opt_height)) {
    data["height"] = opt_height;
  }
  if (goog.isDef(opt_quality)) {
    data["quality"] = opt_quality;
  }
  if (goog.isDef(opt_forceTransparentWhite)) {
    data["force-transparent-white"] = opt_forceTransparentWhite;
  }
  if (goog.isDef(opt_filename)) {
    data["file-name"] = opt_filename;
  }
};
acgraph.vector.Stage.prototype.shareAsJpg = function(onSuccess, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addJpgData_(data, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.JPG, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.addSvgData_ = function(data, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  data["data"] = this.toSvg(opt_paperSizeOrWidth, opt_landscapeOrHeight);
  data["dataType"] = "svg";
  data["responseType"] = "file";
  if (goog.isDef(opt_filename)) {
    data["file-name"] = opt_filename;
  }
};
acgraph.vector.Stage.prototype.shareAsSvg = function(onSuccess, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addSvgData_(data, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.SVG, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.addPdfData_ = function(data, opt_paperSizeOrWidth, opt_landscapeOrWidth, opt_x, opt_y, opt_filename) {
  var formatSize = null;
  var svgStr;
  if (goog.isDef(opt_paperSizeOrWidth)) {
    if (goog.isNumber(opt_paperSizeOrWidth)) {
      data["pdf-width"] = opt_paperSizeOrWidth;
      data["pdf-height"] = goog.isNumber(opt_landscapeOrWidth) ? opt_landscapeOrWidth : this.height();
    } else {
      if (goog.isString(opt_paperSizeOrWidth)) {
        data["pdf-size"] = opt_paperSizeOrWidth || acgraph.vector.PaperSize.A4;
        data["landscape"] = !!opt_landscapeOrWidth;
        formatSize = acgraph.utils.exporting.PdfPaperSize[data["pdf-size"]];
        if (data["landscape"]) {
          formatSize = {width:formatSize.height, height:formatSize.width};
        }
      } else {
        data["pdf-width"] = this.width();
        data["pdf-height"] = this.height();
      }
    }
  } else {
    data["pdf-width"] = this.width();
    data["pdf-height"] = this.height();
  }
  if (goog.isDef(opt_x)) {
    data["pdf-x"] = opt_x;
  }
  if (goog.isDef(opt_y)) {
    data["pdf-y"] = opt_y;
  }
  if (goog.isDef(opt_filename)) {
    data["file-name"] = opt_filename;
  }
  if (formatSize) {
    var proportionalSize = acgraph.math.fitWithProportion(formatSize.width, formatSize.height, (this.width()), (this.height()));
    proportionalSize[0] -= opt_x || 0;
    proportionalSize[1] -= opt_y || 0;
    svgStr = this.toSvg(proportionalSize[0], proportionalSize[1]);
  } else {
    svgStr = this.toSvg();
  }
  data["data"] = svgStr;
  data["dataType"] = "svg";
  data["responseType"] = "file";
};
acgraph.vector.Stage.prototype.shareAsPdf = function(onSuccess, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrWidth, opt_x, opt_y, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPdfData_(data, opt_paperSizeOrWidth, opt_landscapeOrWidth, opt_x, opt_y, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PDF, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.getPngBase64String = function(onSuccess, opt_onError, opt_width, opt_height, opt_quality) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPngData_(data, opt_width, opt_height, opt_quality);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PNG, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.getJpgBase64String = function(onSuccess, opt_onError, opt_width, opt_height, opt_quality, opt_forceTransparentWhite) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addJpgData_(data, opt_width, opt_height, opt_quality, opt_forceTransparentWhite);
    this.shareUrl_(acgraph.vector.Stage.ExportType.JPG, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.getSvgBase64String = function(onSuccess, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addSvgData_(data, opt_paperSizeOrWidth, opt_landscapeOrHeight);
    this.shareUrl_(acgraph.vector.Stage.ExportType.SVG, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.getPdfBase64String = function(onSuccess, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrWidth, opt_x, opt_y) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPdfData_(data, opt_paperSizeOrWidth, opt_landscapeOrWidth, opt_x, opt_y);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PDF, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.saveAsPng = function(opt_width, opt_height, opt_quality, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addPngData_(options, opt_width, opt_height, opt_quality, opt_filename);
    this.getHelperElement().sendRequestToExportServer(acgraph.exportServer + "/png", options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.saveAsJpg = function(opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addJpgData_(options, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename);
    this.getHelperElement().sendRequestToExportServer(acgraph.exportServer + "/jpg", options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.saveAsPdf = function(opt_paperSizeOrWidth, opt_landscapeOrWidth, opt_x, opt_y, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addPdfData_(options, opt_paperSizeOrWidth, opt_landscapeOrWidth, opt_x, opt_y, opt_filename);
    this.getHelperElement().sendRequestToExportServer(acgraph.exportServer + "/pdf", options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.saveAsSvg = function(opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addSvgData_(options, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename);
    this.getHelperElement().sendRequestToExportServer(acgraph.exportServer + "/svg", options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};
acgraph.vector.Stage.prototype.print = function(opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  acgraph.utils.exporting.print(this, opt_paperSizeOrWidth, opt_landscapeOrHeight);
};
acgraph.vector.Stage.prototype.toSvg = function(opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var type = acgraph.type();
  if (type != acgraph.StageType.SVG) {
    return "";
  }
  var result = "";
  if (goog.isDef(opt_paperSizeOrWidth) || goog.isDef(opt_landscapeOrHeight)) {
    var size = acgraph.vector.normalizePageSize(opt_paperSizeOrWidth, opt_landscapeOrHeight);
    var sourceDiv = goog.dom.getParentElement(this.domElement());
    var sourceWidth = goog.style.getStyle(sourceDiv, "width");
    var sourceHeight = goog.style.getStyle(sourceDiv, "height");
    goog.style.setSize(sourceDiv, size.width, size.height);
    this.updateSizeFromContainer();
    this.render();
    acgraph.getRenderer().setStageSize(this.domElement(), (this.width()), (this.height()));
    result = this.serializeToString_(this.domElement());
    goog.style.setStyle(sourceDiv, "width", sourceWidth);
    goog.style.setStyle(sourceDiv, "height", sourceHeight);
    this.updateSizeFromContainer();
    this.render();
  } else {
    acgraph.getRenderer().setStageSize(this.domElement(), (this.width()), (this.height()));
    result = this.serializeToString_(this.domElement());
    acgraph.getRenderer().setStageSize(this.domElement(), this.originalWidth, this.originalHeight);
  }
  return result;
};
acgraph.vector.Stage.prototype.serializeToString_ = function(node) {
  var result = "";
  if (node) {
    var serializer = new XMLSerializer;
    result = serializer.serializeToString(node);
  }
  return result;
};
acgraph.vector.Stage.prototype.layer = acgraph.vector.Layer.prototype.layer;
acgraph.vector.Stage.prototype.unmanagedLayer = acgraph.vector.Layer.prototype.unmanagedLayer;
acgraph.vector.Stage.prototype.text = acgraph.vector.Layer.prototype.text;
acgraph.vector.Stage.prototype.html = acgraph.vector.Layer.prototype.html;
acgraph.vector.Stage.prototype.rect = acgraph.vector.Layer.prototype.rect;
acgraph.vector.Stage.prototype.image = acgraph.vector.Layer.prototype.image;
acgraph.vector.Stage.prototype.roundedRect = acgraph.vector.Layer.prototype.roundedRect;
acgraph.vector.Stage.prototype.roundedInnerRect = acgraph.vector.Layer.prototype.roundedInnerRect;
acgraph.vector.Stage.prototype.truncatedRect = acgraph.vector.Layer.prototype.truncatedRect;
acgraph.vector.Stage.prototype.circle = acgraph.vector.Layer.prototype.circle;
acgraph.vector.Stage.prototype.ellipse = acgraph.vector.Layer.prototype.ellipse;
acgraph.vector.Stage.prototype.path = acgraph.vector.Layer.prototype.path;
acgraph.vector.Stage.prototype.star = acgraph.vector.Layer.prototype.star;
acgraph.vector.Stage.prototype.star4 = acgraph.vector.Layer.prototype.star4;
acgraph.vector.Stage.prototype.star5 = acgraph.vector.Layer.prototype.star5;
acgraph.vector.Stage.prototype.star6 = acgraph.vector.Layer.prototype.star6;
acgraph.vector.Stage.prototype.star7 = acgraph.vector.Layer.prototype.star7;
acgraph.vector.Stage.prototype.star10 = acgraph.vector.Layer.prototype.star10;
acgraph.vector.Stage.prototype.triangleUp = acgraph.vector.Layer.prototype.triangleUp;
acgraph.vector.Stage.prototype.triangleDown = acgraph.vector.Layer.prototype.triangleDown;
acgraph.vector.Stage.prototype.triangleRight = acgraph.vector.Layer.prototype.triangleRight;
acgraph.vector.Stage.prototype.triangleLeft = acgraph.vector.Layer.prototype.triangleLeft;
acgraph.vector.Stage.prototype.diamond = acgraph.vector.Layer.prototype.diamond;
acgraph.vector.Stage.prototype.cross = acgraph.vector.Layer.prototype.cross;
acgraph.vector.Stage.prototype.diagonalCross = acgraph.vector.Layer.prototype.diagonalCross;
acgraph.vector.Stage.prototype.hLine = acgraph.vector.Layer.prototype.hLine;
acgraph.vector.Stage.prototype.vLine = acgraph.vector.Layer.prototype.vLine;
acgraph.vector.Stage.prototype.pie = acgraph.vector.Layer.prototype.pie;
acgraph.vector.Stage.prototype.donut = acgraph.vector.Layer.prototype.donut;
acgraph.vector.Stage.prototype.pattern = function(bounds) {
  return new acgraph.vector.PatternFill(bounds);
};
acgraph.vector.Stage.prototype.hatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  return acgraph.hatchFill(opt_type, opt_color, opt_thickness, opt_size);
};
acgraph.vector.Stage.prototype.numChildren = function() {
  return this.rootLayer_.numChildren();
};
acgraph.vector.Stage.prototype.addChild = function(element) {
  this.rootLayer_.addChild(element);
  return this;
};
acgraph.vector.Stage.prototype.addChildAt = function(element, index) {
  this.rootLayer_.addChildAt(element, index);
  return this;
};
acgraph.vector.Stage.prototype.getChildAt = function(index) {
  return this.rootLayer_.getChildAt(index);
};
acgraph.vector.Stage.prototype.removeChild = function(element) {
  return this.rootLayer_.removeChild(element);
};
acgraph.vector.Stage.prototype.removeChildAt = function(index) {
  return this.rootLayer_.removeChildAt(index);
};
acgraph.vector.Stage.prototype.removeChildren = function() {
  return this.rootLayer_.removeChildren();
};
acgraph.vector.Stage.prototype.hasChild = function(element) {
  return this.rootLayer_.hasChild(element);
};
acgraph.vector.Stage.prototype.indexOfChild = function(element) {
  return this.rootLayer_.indexOfChild(element);
};
acgraph.vector.Stage.prototype.swapChildren = function(element1, element2) {
  this.rootLayer_.swapChildren(element1, element2);
  return this;
};
acgraph.vector.Stage.prototype.swapChildrenAt = function(index1, index2) {
  this.rootLayer_.swapChildrenAt(index1, index2);
  return this;
};
acgraph.vector.Stage.prototype.forEachChild = function(callback, opt_this) {
  this.rootLayer_.forEachChild(callback, opt_this);
  return this;
};
acgraph.vector.Stage.prototype.remove = function() {
  acgraph.getRenderer().removeNode(this.domElement());
  return this;
};
acgraph.vector.Stage.prototype.notifyRemoved = function(child) {
  this.rootLayer_.notifyRemoved(child);
};
acgraph.vector.Stage.prototype.childClipChanged = goog.nullFunction;
acgraph.vector.Stage.prototype.title = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleVal_ != opt_value) {
      this.titleVal_ = opt_value;
      acgraph.getRenderer().setTitle(this, this.titleVal_);
    }
    return this;
  } else {
    return this.titleVal_;
  }
};
acgraph.vector.Stage.prototype.desc = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.descVal_ != opt_value) {
      this.descVal_ = opt_value;
      acgraph.getRenderer().setDesc(this, this.descVal_);
    }
    return this;
  } else {
    return this.descVal_;
  }
};
acgraph.vector.Stage.prototype.getX = function() {
  return 0;
};
acgraph.vector.Stage.prototype.getY = function() {
  return 0;
};
acgraph.vector.Stage.prototype.getBounds = function() {
  return new acgraph.math.Rect(0, 0, (this.width()), (this.height()));
};
acgraph.vector.Stage.prototype.rotate = function(degrees, opt_cx, opt_cy) {
  this.rootLayer_.rotate(degrees, opt_cx, opt_cy);
  return this;
};
acgraph.vector.Stage.prototype.rotateByAnchor = function(degrees, opt_anchor) {
  this.rootLayer_.rotateByAnchor(degrees, opt_anchor);
  return this;
};
acgraph.vector.Stage.prototype.setRotation = function(degrees, opt_cx, opt_cy) {
  this.rootLayer_.setRotation(degrees, opt_cx, opt_cy);
  return this;
};
acgraph.vector.Stage.prototype.setRotationByAnchor = function(degrees, opt_anchor) {
  this.rootLayer_.setRotationByAnchor(degrees, opt_anchor);
  return this;
};
acgraph.vector.Stage.prototype.translate = function(tx, ty) {
  this.rootLayer_.translate(tx, ty);
  return this;
};
acgraph.vector.Stage.prototype.setPosition = function(x, y) {
  this.rootLayer_.setPosition(x, y);
  return this;
};
acgraph.vector.Stage.prototype.scale = function(sx, sy, opt_cx, opt_cy) {
  this.rootLayer_.scale(sx, sy, opt_cx, opt_cy);
  return this;
};
acgraph.vector.Stage.prototype.scaleByAnchor = function(sx, sy, opt_anchor) {
  this.rootLayer_.scaleByAnchor(sx, sy, opt_anchor);
  return this;
};
acgraph.vector.Stage.prototype.appendTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.rootLayer_.appendTransformationMatrix(m00, m10, m01, m11, m02, m12);
  return this;
};
acgraph.vector.Stage.prototype.setTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.rootLayer_.setTransformationMatrix(m00, m10, m01, m11, m02, m12);
  return this;
};
acgraph.vector.Stage.prototype.getRotationAngle = function() {
  return this.rootLayer_.getRotationAngle();
};
acgraph.vector.Stage.prototype.getTransformationMatrix = function() {
  return this.rootLayer_.getTransformationMatrix();
};
acgraph.vector.Stage.prototype.getFullTransformation = function() {
  return null;
};
acgraph.vector.Stage.prototype.clip = function(opt_value) {
  return this.rootLayer_.clip(opt_value);
};
acgraph.vector.Stage.prototype.createClip = function(opt_leftOrRect, opt_top, opt_width, opt_height) {
  return new acgraph.vector.Clip(this, opt_leftOrRect, opt_top, opt_width, opt_height);
};
acgraph.vector.Stage.prototype.addClipForRender = function(clip) {
  if (!this.isSuspended()) {
    clip.render();
  } else {
    this.clipsToRender_.push(clip);
  }
};
acgraph.vector.Stage.prototype.removeClipFromRender = function(clip) {
  goog.array.remove(this.clipsToRender_, clip);
};
acgraph.vector.Stage.prototype.dispatchEvent = function(e) {
  if (goog.isString(e)) {
    e = e.toLowerCase();
  } else {
    if ("type" in e) {
      e.type = String(e.type).toLowerCase();
    }
  }
  return goog.base(this, "dispatchEvent", e);
};
acgraph.vector.Stage.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return (goog.base(this, "listen", String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};
acgraph.vector.Stage.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return (goog.base(this, "listenOnce", String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};
acgraph.vector.Stage.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return goog.base(this, "unlisten", String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};
acgraph.vector.Stage.prototype.unlistenByKey;
acgraph.vector.Stage.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) {
    opt_type = String(opt_type).toLowerCase();
  }
  return goog.base(this, "removeAllListeners", opt_type);
};
acgraph.vector.Stage.prototype.deserialize = function(data) {
  this.width(data["width"]).height(data["height"]);
  data["type"] = "layer";
  this.getRootLayer().deserialize(data);
  this.getRootLayer().id("");
  if ("id" in data) {
    this.id(data["id"]);
  }
};
acgraph.vector.Stage.prototype.serialize = function() {
  var data = this.getRootLayer().serialize();
  if (this.id_) {
    data["id"] = this.id_;
  }
  data["width"] = this.width();
  data["height"] = this.height();
  delete data["type"];
  return data;
};
acgraph.vector.Stage.prototype.dispose = function() {
  goog.base(this, "dispose");
};
acgraph.vector.Stage.prototype.disposeInternal = function() {
  acgraph.vector.Stage.base(this, "disposeInternal");
  goog.dispose(this.helperElement_);
  this.helperElement_ = null;
  this.eventHandler_.removeAll();
  goog.dispose(this.eventHandler_);
  this.eventHandler_ = null;
  goog.dispose(this.rootLayer_);
  this.renderInternal();
  delete this.rootLayer_;
  goog.dispose(this.defs_);
  delete this.defs_;
  acgraph.unregister(this);
  goog.dom.removeNode(this.container_);
  this.domElement_ = null;
  this.container_ = null;
  this.originContainer_ = null;
};
goog.exportSymbol("acgraph.vector.Stage", acgraph.vector.Stage);
acgraph.vector.Stage.prototype["id"] = acgraph.vector.Stage.prototype.id;
acgraph.vector.Stage.prototype["container"] = acgraph.vector.Stage.prototype.container;
acgraph.vector.Stage.prototype["dispose"] = acgraph.vector.Stage.prototype.dispose;
acgraph.vector.Stage.prototype["getBounds"] = acgraph.vector.Stage.prototype.getBounds;
acgraph.vector.Stage.prototype["layer"] = acgraph.vector.Stage.prototype.layer;
acgraph.vector.Stage.prototype["unmanagedLayer"] = acgraph.vector.Stage.prototype.unmanagedLayer;
acgraph.vector.Stage.prototype["circle"] = acgraph.vector.Stage.prototype.circle;
acgraph.vector.Stage.prototype["ellipse"] = acgraph.vector.Stage.prototype.ellipse;
acgraph.vector.Stage.prototype["rect"] = acgraph.vector.Stage.prototype.rect;
acgraph.vector.Stage.prototype["truncatedRect"] = acgraph.vector.Stage.prototype.truncatedRect;
acgraph.vector.Stage.prototype["roundedRect"] = acgraph.vector.Stage.prototype.roundedRect;
acgraph.vector.Stage.prototype["roundedInnerRect"] = acgraph.vector.Stage.prototype.roundedInnerRect;
acgraph.vector.Stage.prototype["path"] = acgraph.vector.Stage.prototype.path;
acgraph.vector.Stage.prototype["star"] = acgraph.vector.Stage.prototype.star;
acgraph.vector.Stage.prototype["star4"] = acgraph.vector.Stage.prototype.star4;
acgraph.vector.Stage.prototype["star5"] = acgraph.vector.Stage.prototype.star5;
acgraph.vector.Stage.prototype["star6"] = acgraph.vector.Stage.prototype.star6;
acgraph.vector.Stage.prototype["star7"] = acgraph.vector.Stage.prototype.star7;
acgraph.vector.Stage.prototype["star10"] = acgraph.vector.Stage.prototype.star10;
acgraph.vector.Stage.prototype["diamond"] = acgraph.vector.Stage.prototype.diamond;
acgraph.vector.Stage.prototype["triangleUp"] = acgraph.vector.Stage.prototype.triangleUp;
acgraph.vector.Stage.prototype["triangleDown"] = acgraph.vector.Stage.prototype.triangleDown;
acgraph.vector.Stage.prototype["triangleRight"] = acgraph.vector.Stage.prototype.triangleRight;
acgraph.vector.Stage.prototype["triangleLeft"] = acgraph.vector.Stage.prototype.triangleLeft;
acgraph.vector.Stage.prototype["cross"] = acgraph.vector.Stage.prototype.cross;
acgraph.vector.Stage.prototype["diagonalCross"] = acgraph.vector.Stage.prototype.diagonalCross;
acgraph.vector.Stage.prototype["hLine"] = acgraph.vector.Stage.prototype.hLine;
acgraph.vector.Stage.prototype["vLine"] = acgraph.vector.Stage.prototype.vLine;
acgraph.vector.Stage.prototype["pie"] = acgraph.vector.Stage.prototype.pie;
acgraph.vector.Stage.prototype["donut"] = acgraph.vector.Stage.prototype.donut;
acgraph.vector.Stage.prototype["text"] = acgraph.vector.Stage.prototype.text;
acgraph.vector.Stage.prototype["html"] = acgraph.vector.Stage.prototype.html;
acgraph.vector.Stage.prototype["image"] = acgraph.vector.Stage.prototype.image;
acgraph.vector.Stage.prototype["data"] = acgraph.vector.Stage.prototype.data;
acgraph.vector.Stage.prototype["saveAsPNG"] = acgraph.vector.Stage.prototype.saveAsPng;
acgraph.vector.Stage.prototype["saveAsJPG"] = acgraph.vector.Stage.prototype.saveAsJpg;
acgraph.vector.Stage.prototype["saveAsPDF"] = acgraph.vector.Stage.prototype.saveAsPdf;
acgraph.vector.Stage.prototype["saveAsSVG"] = acgraph.vector.Stage.prototype.saveAsSvg;
acgraph.vector.Stage.prototype["saveAsPng"] = acgraph.vector.Stage.prototype.saveAsPng;
acgraph.vector.Stage.prototype["saveAsJpg"] = acgraph.vector.Stage.prototype.saveAsJpg;
acgraph.vector.Stage.prototype["saveAsPdf"] = acgraph.vector.Stage.prototype.saveAsPdf;
acgraph.vector.Stage.prototype["saveAsSvg"] = acgraph.vector.Stage.prototype.saveAsSvg;
acgraph.vector.Stage.prototype["shareAsPng"] = acgraph.vector.Stage.prototype.shareAsPng;
acgraph.vector.Stage.prototype["shareAsJpg"] = acgraph.vector.Stage.prototype.shareAsJpg;
acgraph.vector.Stage.prototype["shareAsPdf"] = acgraph.vector.Stage.prototype.shareAsPdf;
acgraph.vector.Stage.prototype["shareAsSvg"] = acgraph.vector.Stage.prototype.shareAsSvg;
acgraph.vector.Stage.prototype["getPngBase64String"] = acgraph.vector.Stage.prototype.getPngBase64String;
acgraph.vector.Stage.prototype["getJpgBase64String"] = acgraph.vector.Stage.prototype.getJpgBase64String;
acgraph.vector.Stage.prototype["getSvgBase64String"] = acgraph.vector.Stage.prototype.getSvgBase64String;
acgraph.vector.Stage.prototype["getPdfBase64String"] = acgraph.vector.Stage.prototype.getPdfBase64String;
acgraph.vector.Stage.prototype["print"] = acgraph.vector.Stage.prototype.print;
acgraph.vector.Stage.prototype["toSvg"] = acgraph.vector.Stage.prototype.toSvg;
acgraph.vector.Stage.prototype["pattern"] = acgraph.vector.Stage.prototype.pattern;
acgraph.vector.Stage.prototype["hatchFill"] = acgraph.vector.Stage.prototype.hatchFill;
acgraph.vector.Stage.prototype["clearDefs"] = acgraph.vector.Stage.prototype.clearDefs;
acgraph.vector.Stage.prototype["numChildren"] = acgraph.vector.Stage.prototype.numChildren;
acgraph.vector.Stage.prototype["addChild"] = acgraph.vector.Stage.prototype.addChild;
acgraph.vector.Stage.prototype["addChildAt"] = acgraph.vector.Stage.prototype.addChildAt;
acgraph.vector.Stage.prototype["removeChild"] = acgraph.vector.Stage.prototype.removeChild;
acgraph.vector.Stage.prototype["removeChildAt"] = acgraph.vector.Stage.prototype.removeChildAt;
acgraph.vector.Stage.prototype["removeChildren"] = acgraph.vector.Stage.prototype.removeChildren;
acgraph.vector.Stage.prototype["swapChildren"] = acgraph.vector.Stage.prototype.swapChildren;
acgraph.vector.Stage.prototype["swapChildrenAt"] = acgraph.vector.Stage.prototype.swapChildrenAt;
acgraph.vector.Stage.prototype["getChildAt"] = acgraph.vector.Stage.prototype.getChildAt;
acgraph.vector.Stage.prototype["hasChild"] = acgraph.vector.Stage.prototype.hasChild;
acgraph.vector.Stage.prototype["forEachChild"] = acgraph.vector.Stage.prototype.forEachChild;
acgraph.vector.Stage.prototype["indexOfChild"] = acgraph.vector.Stage.prototype.indexOfChild;
acgraph.vector.Stage.prototype["getX"] = acgraph.vector.Stage.prototype.getX;
acgraph.vector.Stage.prototype["getY"] = acgraph.vector.Stage.prototype.getY;
acgraph.vector.Stage.prototype["width"] = acgraph.vector.Stage.prototype.width;
acgraph.vector.Stage.prototype["height"] = acgraph.vector.Stage.prototype.height;
acgraph.vector.Stage.prototype["getBounds"] = acgraph.vector.Stage.prototype.getBounds;
acgraph.vector.Stage.prototype["resize"] = acgraph.vector.Stage.prototype.resize;
acgraph.vector.Stage.prototype["asyncMode"] = acgraph.vector.Stage.prototype.asyncMode;
acgraph.vector.Stage.prototype["resume"] = acgraph.vector.Stage.prototype.resume;
acgraph.vector.Stage.prototype["suspend"] = acgraph.vector.Stage.prototype.suspend;
acgraph.vector.Stage.prototype["isRendering"] = acgraph.vector.Stage.prototype.isRendering;
acgraph.vector.Stage.prototype["isSuspended"] = acgraph.vector.Stage.prototype.isSuspended;
acgraph.vector.Stage.prototype["remove"] = acgraph.vector.Stage.prototype.remove;
acgraph.vector.Stage.prototype["domElement"] = acgraph.vector.Stage.prototype.domElement;
acgraph.vector.Stage.prototype["visible"] = acgraph.vector.Stage.prototype.visible;
acgraph.vector.Stage.prototype["rotate"] = acgraph.vector.Stage.prototype.rotate;
acgraph.vector.Stage.prototype["rotateByAnchor"] = acgraph.vector.Stage.prototype.rotateByAnchor;
acgraph.vector.Stage.prototype["setRotation"] = acgraph.vector.Stage.prototype.setRotation;
acgraph.vector.Stage.prototype["setRotationByAnchor"] = acgraph.vector.Stage.prototype.setRotationByAnchor;
acgraph.vector.Stage.prototype["translate"] = acgraph.vector.Stage.prototype.translate;
acgraph.vector.Stage.prototype["setPosition"] = acgraph.vector.Stage.prototype.setPosition;
acgraph.vector.Stage.prototype["scale"] = acgraph.vector.Stage.prototype.scale;
acgraph.vector.Stage.prototype["scaleByAnchor"] = acgraph.vector.Stage.prototype.scaleByAnchor;
acgraph.vector.Stage.prototype["appendTransformationMatrix"] = acgraph.vector.Stage.prototype.appendTransformationMatrix;
acgraph.vector.Stage.prototype["setTransformationMatrix"] = acgraph.vector.Stage.prototype.setTransformationMatrix;
acgraph.vector.Stage.prototype["getRotationAngle"] = acgraph.vector.Stage.prototype.getRotationAngle;
acgraph.vector.Stage.prototype["getTransformationMatrix"] = acgraph.vector.Stage.prototype.getTransformationMatrix;
acgraph.vector.Stage.prototype["clip"] = acgraph.vector.Stage.prototype.clip;
acgraph.vector.Stage.prototype["createClip"] = acgraph.vector.Stage.prototype.createClip;
acgraph.vector.Stage.prototype["parent"] = acgraph.vector.Stage.prototype.parent;
acgraph.vector.Stage.prototype["getStage"] = acgraph.vector.Stage.prototype.getStage;
acgraph.vector.Stage.prototype["listen"] = acgraph.vector.Stage.prototype.listen;
acgraph.vector.Stage.prototype["listenOnce"] = acgraph.vector.Stage.prototype.listenOnce;
acgraph.vector.Stage.prototype["unlisten"] = acgraph.vector.Stage.prototype.unlisten;
acgraph.vector.Stage.prototype["unlistenByKey"] = acgraph.vector.Stage.prototype.unlistenByKey;
acgraph.vector.Stage.prototype["removeAllListeners"] = acgraph.vector.Stage.prototype.removeAllListeners;
acgraph.vector.Stage.prototype["title"] = acgraph.vector.Stage.prototype.title;
acgraph.vector.Stage.prototype["desc"] = acgraph.vector.Stage.prototype.desc;
goog.exportSymbol("acgraph.events.EventType.RENDER_START", acgraph.vector.Stage.EventType.RENDER_START);
goog.exportSymbol("acgraph.events.EventType.RENDER_FINISH", acgraph.vector.Stage.EventType.RENDER_FINISH);
goog.exportSymbol("acgraph.vector.Stage.EventType.STAGE_RESIZE", acgraph.vector.Stage.EventType.STAGE_RESIZE);
goog.exportSymbol("acgraph.vector.Stage.EventType.STAGE_RENDERED", acgraph.vector.Stage.EventType.STAGE_RENDERED);
goog.provide("acgraph.vector.svg.Stage");
goog.require("acgraph.vector.Stage");
goog.require("acgraph.vector.svg.Defs");
acgraph.vector.svg.Stage = function(opt_container, opt_width, opt_height) {
  goog.base(this, opt_container, opt_width, opt_height);
};
goog.inherits(acgraph.vector.svg.Stage, acgraph.vector.Stage);
acgraph.vector.svg.Stage.prototype.createDefs = function() {
  return new acgraph.vector.svg.Defs(this);
};
goog.provide("acgraph.vector.vml.RadialGradient");
goog.require("acgraph.vector.RadialGradient");
acgraph.vector.vml.RadialGradient = function(keys, cx, cy, size_x, size_y, opt_opacity, opt_mode) {
  goog.base(this, keys, cx, cy, cx, cx, opt_opacity, opt_mode);
  this.size_x = size_x;
  this.size_y = size_y;
};
goog.inherits(acgraph.vector.vml.RadialGradient, acgraph.vector.RadialGradient);
acgraph.vector.vml.RadialGradient.serialize = function(keys, cx, cy, size_x, size_y, opt_opacity, opt_mode) {
  var opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  var gradientKeys = [];
  goog.array.forEach(keys, function(el) {
    gradientKeys.push("" + el.offset + el.color + (el.opacity ? el.opacity : null));
  });
  var boundsToString = opt_mode ? "" + opt_mode.left + opt_mode.top + opt_mode.width + opt_mode.height : "";
  return gradientKeys.join("") + opacity + cx + cy + size_x + size_y + boundsToString;
};
goog.provide("goog.color.names");
goog.color.names = {"aliceblue":"#f0f8ff", "antiquewhite":"#faebd7", "aqua":"#00ffff", "aquamarine":"#7fffd4", "azure":"#f0ffff", "beige":"#f5f5dc", "bisque":"#ffe4c4", "black":"#000000", "blanchedalmond":"#ffebcd", "blue":"#0000ff", "blueviolet":"#8a2be2", "brown":"#a52a2a", "burlywood":"#deb887", "cadetblue":"#5f9ea0", "chartreuse":"#7fff00", "chocolate":"#d2691e", "coral":"#ff7f50", "cornflowerblue":"#6495ed", "cornsilk":"#fff8dc", "crimson":"#dc143c", "cyan":"#00ffff", "darkblue":"#00008b", "darkcyan":"#008b8b", 
"darkgoldenrod":"#b8860b", "darkgray":"#a9a9a9", "darkgreen":"#006400", "darkgrey":"#a9a9a9", "darkkhaki":"#bdb76b", "darkmagenta":"#8b008b", "darkolivegreen":"#556b2f", "darkorange":"#ff8c00", "darkorchid":"#9932cc", "darkred":"#8b0000", "darksalmon":"#e9967a", "darkseagreen":"#8fbc8f", "darkslateblue":"#483d8b", "darkslategray":"#2f4f4f", "darkslategrey":"#2f4f4f", "darkturquoise":"#00ced1", "darkviolet":"#9400d3", "deeppink":"#ff1493", "deepskyblue":"#00bfff", "dimgray":"#696969", "dimgrey":"#696969", 
"dodgerblue":"#1e90ff", "firebrick":"#b22222", "floralwhite":"#fffaf0", "forestgreen":"#228b22", "fuchsia":"#ff00ff", "gainsboro":"#dcdcdc", "ghostwhite":"#f8f8ff", "gold":"#ffd700", "goldenrod":"#daa520", "gray":"#808080", "green":"#008000", "greenyellow":"#adff2f", "grey":"#808080", "honeydew":"#f0fff0", "hotpink":"#ff69b4", "indianred":"#cd5c5c", "indigo":"#4b0082", "ivory":"#fffff0", "khaki":"#f0e68c", "lavender":"#e6e6fa", "lavenderblush":"#fff0f5", "lawngreen":"#7cfc00", "lemonchiffon":"#fffacd", 
"lightblue":"#add8e6", "lightcoral":"#f08080", "lightcyan":"#e0ffff", "lightgoldenrodyellow":"#fafad2", "lightgray":"#d3d3d3", "lightgreen":"#90ee90", "lightgrey":"#d3d3d3", "lightpink":"#ffb6c1", "lightsalmon":"#ffa07a", "lightseagreen":"#20b2aa", "lightskyblue":"#87cefa", "lightslategray":"#778899", "lightslategrey":"#778899", "lightsteelblue":"#b0c4de", "lightyellow":"#ffffe0", "lime":"#00ff00", "limegreen":"#32cd32", "linen":"#faf0e6", "magenta":"#ff00ff", "maroon":"#800000", "mediumaquamarine":"#66cdaa", 
"mediumblue":"#0000cd", "mediumorchid":"#ba55d3", "mediumpurple":"#9370db", "mediumseagreen":"#3cb371", "mediumslateblue":"#7b68ee", "mediumspringgreen":"#00fa9a", "mediumturquoise":"#48d1cc", "mediumvioletred":"#c71585", "midnightblue":"#191970", "mintcream":"#f5fffa", "mistyrose":"#ffe4e1", "moccasin":"#ffe4b5", "navajowhite":"#ffdead", "navy":"#000080", "oldlace":"#fdf5e6", "olive":"#808000", "olivedrab":"#6b8e23", "orange":"#ffa500", "orangered":"#ff4500", "orchid":"#da70d6", "palegoldenrod":"#eee8aa", 
"palegreen":"#98fb98", "paleturquoise":"#afeeee", "palevioletred":"#db7093", "papayawhip":"#ffefd5", "peachpuff":"#ffdab9", "peru":"#cd853f", "pink":"#ffc0cb", "plum":"#dda0dd", "powderblue":"#b0e0e6", "purple":"#800080", "red":"#ff0000", "rosybrown":"#bc8f8f", "royalblue":"#4169e1", "saddlebrown":"#8b4513", "salmon":"#fa8072", "sandybrown":"#f4a460", "seagreen":"#2e8b57", "seashell":"#fff5ee", "sienna":"#a0522d", "silver":"#c0c0c0", "skyblue":"#87ceeb", "slateblue":"#6a5acd", "slategray":"#708090", 
"slategrey":"#708090", "snow":"#fffafa", "springgreen":"#00ff7f", "steelblue":"#4682b4", "tan":"#d2b48c", "teal":"#008080", "thistle":"#d8bfd8", "tomato":"#ff6347", "turquoise":"#40e0d0", "violet":"#ee82ee", "wheat":"#f5deb3", "white":"#ffffff", "whitesmoke":"#f5f5f5", "yellow":"#ffff00", "yellowgreen":"#9acd32"};
goog.provide("goog.color");
goog.provide("goog.color.Hsl");
goog.provide("goog.color.Hsv");
goog.provide("goog.color.Rgb");
goog.require("goog.color.names");
goog.require("goog.math");
goog.color.Rgb;
goog.color.Hsv;
goog.color.Hsl;
goog.color.parse = function(str) {
  var result = {};
  str = String(str);
  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  if (goog.color.isValidHexColor_(maybeHex)) {
    result.hex = goog.color.normalizeHex(maybeHex);
    result.type = "hex";
    return result;
  } else {
    var rgb = goog.color.isValidRgbColor_(str);
    if (rgb.length) {
      result.hex = goog.color.rgbArrayToHex(rgb);
      result.type = "rgb";
      return result;
    } else {
      if (goog.color.names) {
        var hex = goog.color.names[str.toLowerCase()];
        if (hex) {
          result.hex = hex;
          result.type = "named";
          return result;
        }
      }
    }
  }
  throw Error(str + " is not a valid color string");
};
goog.color.isValidColor = function(str) {
  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  return !!(goog.color.isValidHexColor_(maybeHex) || goog.color.isValidRgbColor_(str).length || goog.color.names && goog.color.names[str.toLowerCase()]);
};
goog.color.parseRgb = function(str) {
  var rgb = goog.color.isValidRgbColor_(str);
  if (!rgb.length) {
    throw Error(str + " is not a valid RGB color");
  }
  return rgb;
};
goog.color.hexToRgbStyle = function(hexColor) {
  return goog.color.rgbStyle_(goog.color.hexToRgb(hexColor));
};
goog.color.hexTripletRe_ = /#(.)(.)(.)/;
goog.color.normalizeHex = function(hexColor) {
  if (!goog.color.isValidHexColor_(hexColor)) {
    throw Error("'" + hexColor + "' is not a valid hex color");
  }
  if (hexColor.length == 4) {
    hexColor = hexColor.replace(goog.color.hexTripletRe_, "#$1$1$2$2$3$3");
  }
  return hexColor.toLowerCase();
};
goog.color.hexToRgb = function(hexColor) {
  hexColor = goog.color.normalizeHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16);
  var g = parseInt(hexColor.substr(3, 2), 16);
  var b = parseInt(hexColor.substr(5, 2), 16);
  return [r, g, b];
};
goog.color.rgbToHex = function(r, g, b) {
  r = Number(r);
  g = Number(g);
  b = Number(b);
  if (r != (r & 255) || g != (g & 255) || b != (b & 255)) {
    throw Error('"(' + r + "," + g + "," + b + '") is not a valid RGB color');
  }
  var hexR = goog.color.prependZeroIfNecessaryHelper(r.toString(16));
  var hexG = goog.color.prependZeroIfNecessaryHelper(g.toString(16));
  var hexB = goog.color.prependZeroIfNecessaryHelper(b.toString(16));
  return "#" + hexR + hexG + hexB;
};
goog.color.rgbArrayToHex = function(rgb) {
  return goog.color.rgbToHex(rgb[0], rgb[1], rgb[2]);
};
goog.color.rgbToHsl = function(r, g, b) {
  var normR = r / 255;
  var normG = g / 255;
  var normB = b / 255;
  var max = Math.max(normR, normG, normB);
  var min = Math.min(normR, normG, normB);
  var h = 0;
  var s = 0;
  var l = .5 * (max + min);
  if (max != min) {
    if (max == normR) {
      h = 60 * (normG - normB) / (max - min);
    } else {
      if (max == normG) {
        h = 60 * (normB - normR) / (max - min) + 120;
      } else {
        if (max == normB) {
          h = 60 * (normR - normG) / (max - min) + 240;
        }
      }
    }
    if (0 < l && l <= .5) {
      s = (max - min) / (2 * l);
    } else {
      s = (max - min) / (2 - 2 * l);
    }
  }
  return [Math.round(h + 360) % 360, s, l];
};
goog.color.rgbArrayToHsl = function(rgb) {
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]);
};
goog.color.hueToRgb_ = function(v1, v2, vH) {
  if (vH < 0) {
    vH += 1;
  } else {
    if (vH > 1) {
      vH -= 1;
    }
  }
  if (6 * vH < 1) {
    return v1 + (v2 - v1) * 6 * vH;
  } else {
    if (2 * vH < 1) {
      return v2;
    } else {
      if (3 * vH < 2) {
        return v1 + (v2 - v1) * (2 / 3 - vH) * 6;
      }
    }
  }
  return v1;
};
goog.color.hslToRgb = function(h, s, l) {
  var r = 0;
  var g = 0;
  var b = 0;
  var normH = h / 360;
  if (s == 0) {
    r = g = b = l * 255;
  } else {
    var temp1 = 0;
    var temp2 = 0;
    if (l < .5) {
      temp2 = l * (1 + s);
    } else {
      temp2 = l + s - s * l;
    }
    temp1 = 2 * l - temp2;
    r = 255 * goog.color.hueToRgb_(temp1, temp2, normH + 1 / 3);
    g = 255 * goog.color.hueToRgb_(temp1, temp2, normH);
    b = 255 * goog.color.hueToRgb_(temp1, temp2, normH - 1 / 3);
  }
  return [Math.round(r), Math.round(g), Math.round(b)];
};
goog.color.hslArrayToRgb = function(hsl) {
  return goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]);
};
goog.color.validHexColorRe_ = /^#(?:[0-9a-f]{3}){1,2}$/i;
goog.color.isValidHexColor_ = function(str) {
  return goog.color.validHexColorRe_.test(str);
};
goog.color.normalizedHexColorRe_ = /^#[0-9a-f]{6}$/;
goog.color.isNormalizedHexColor_ = function(str) {
  return goog.color.normalizedHexColorRe_.test(str);
};
goog.color.rgbColorRe_ = /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;
goog.color.isValidRgbColor_ = function(str) {
  var regExpResultArray = str.match(goog.color.rgbColorRe_);
  if (regExpResultArray) {
    var r = Number(regExpResultArray[1]);
    var g = Number(regExpResultArray[2]);
    var b = Number(regExpResultArray[3]);
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return [r, g, b];
    }
  }
  return [];
};
goog.color.prependZeroIfNecessaryHelper = function(hex) {
  return hex.length == 1 ? "0" + hex : hex;
};
goog.color.prependHashIfNecessaryHelper = function(str) {
  return str.charAt(0) == "#" ? str : "#" + str;
};
goog.color.rgbStyle_ = function(rgb) {
  return "rgb(" + rgb.join(",") + ")";
};
goog.color.hsvToRgb = function(h, s, brightness) {
  var red = 0;
  var green = 0;
  var blue = 0;
  if (s == 0) {
    red = brightness;
    green = brightness;
    blue = brightness;
  } else {
    var sextant = Math.floor(h / 60);
    var remainder = h / 60 - sextant;
    var val1 = brightness * (1 - s);
    var val2 = brightness * (1 - s * remainder);
    var val3 = brightness * (1 - s * (1 - remainder));
    switch(sextant) {
      case 1:
        red = val2;
        green = brightness;
        blue = val1;
        break;
      case 2:
        red = val1;
        green = brightness;
        blue = val3;
        break;
      case 3:
        red = val1;
        green = val2;
        blue = brightness;
        break;
      case 4:
        red = val3;
        green = val1;
        blue = brightness;
        break;
      case 5:
        red = brightness;
        green = val1;
        blue = val2;
        break;
      case 6:
      ;
      case 0:
        red = brightness;
        green = val3;
        blue = val1;
        break;
    }
  }
  return [Math.floor(red), Math.floor(green), Math.floor(blue)];
};
goog.color.rgbToHsv = function(red, green, blue) {
  var max = Math.max(Math.max(red, green), blue);
  var min = Math.min(Math.min(red, green), blue);
  var hue;
  var saturation;
  var value = max;
  if (min == max) {
    hue = 0;
    saturation = 0;
  } else {
    var delta = max - min;
    saturation = delta / max;
    if (red == max) {
      hue = (green - blue) / delta;
    } else {
      if (green == max) {
        hue = 2 + (blue - red) / delta;
      } else {
        hue = 4 + (red - green) / delta;
      }
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
    if (hue > 360) {
      hue -= 360;
    }
  }
  return [hue, saturation, value];
};
goog.color.rgbArrayToHsv = function(rgb) {
  return goog.color.rgbToHsv(rgb[0], rgb[1], rgb[2]);
};
goog.color.hsvArrayToRgb = function(hsv) {
  return goog.color.hsvToRgb(hsv[0], hsv[1], hsv[2]);
};
goog.color.hexToHsl = function(hex) {
  var rgb = goog.color.hexToRgb(hex);
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]);
};
goog.color.hslToHex = function(h, s, l) {
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(h, s, l));
};
goog.color.hslArrayToHex = function(hsl) {
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]));
};
goog.color.hexToHsv = function(hex) {
  return goog.color.rgbArrayToHsv(goog.color.hexToRgb(hex));
};
goog.color.hsvToHex = function(h, s, v) {
  return goog.color.rgbArrayToHex(goog.color.hsvToRgb(h, s, v));
};
goog.color.hsvArrayToHex = function(hsv) {
  return goog.color.hsvToHex(hsv[0], hsv[1], hsv[2]);
};
goog.color.hslDistance = function(hsl1, hsl2) {
  var sl1, sl2;
  if (hsl1[2] <= .5) {
    sl1 = hsl1[1] * hsl1[2];
  } else {
    sl1 = hsl1[1] * (1 - hsl1[2]);
  }
  if (hsl2[2] <= .5) {
    sl2 = hsl2[1] * hsl2[2];
  } else {
    sl2 = hsl2[1] * (1 - hsl2[2]);
  }
  var h1 = hsl1[0] / 360;
  var h2 = hsl2[0] / 360;
  var dh = (h1 - h2) * 2 * Math.PI;
  return (hsl1[2] - hsl2[2]) * (hsl1[2] - hsl2[2]) + sl1 * sl1 + sl2 * sl2 - 2 * sl1 * sl2 * Math.cos(dh);
};
goog.color.blend = function(rgb1, rgb2, factor) {
  factor = goog.math.clamp(factor, 0, 1);
  return [Math.round(factor * rgb1[0] + (1 - factor) * rgb2[0]), Math.round(factor * rgb1[1] + (1 - factor) * rgb2[1]), Math.round(factor * rgb1[2] + (1 - factor) * rgb2[2])];
};
goog.color.darken = function(rgb, factor) {
  var black = [0, 0, 0];
  return goog.color.blend(black, rgb, factor);
};
goog.color.lighten = function(rgb, factor) {
  var white = [255, 255, 255];
  return goog.color.blend(white, rgb, factor);
};
goog.color.highContrast = function(prime, suggestions) {
  var suggestionsWithDiff = [];
  for (var i = 0;i < suggestions.length;i++) {
    suggestionsWithDiff.push({color:suggestions[i], diff:goog.color.yiqBrightnessDiff_(suggestions[i], prime) + goog.color.colorDiff_(suggestions[i], prime)});
  }
  suggestionsWithDiff.sort(function(a, b) {
    return b.diff - a.diff;
  });
  return suggestionsWithDiff[0].color;
};
goog.color.yiqBrightness_ = function(rgb) {
  return Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1E3);
};
goog.color.yiqBrightnessDiff_ = function(rgb1, rgb2) {
  return Math.abs(goog.color.yiqBrightness_(rgb1) - goog.color.yiqBrightness_(rgb2));
};
goog.color.colorDiff_ = function(rgb1, rgb2) {
  return Math.abs(rgb1[0] - rgb2[0]) + Math.abs(rgb1[1] - rgb2[1]) + Math.abs(rgb1[2] - rgb2[2]);
};
goog.provide("goog.net.ImageLoader");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.dom.TagName");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.net.EventType");
goog.require("goog.object");
goog.require("goog.userAgent");
goog.net.ImageLoader = function(opt_parent) {
  goog.events.EventTarget.call(this);
  this.imageIdToRequestMap_ = {};
  this.imageIdToImageMap_ = {};
  this.handler_ = new goog.events.EventHandler(this);
  this.parent_ = opt_parent;
};
goog.inherits(goog.net.ImageLoader, goog.events.EventTarget);
goog.net.ImageLoader.CorsRequestType = {ANONYMOUS:"anonymous", USE_CREDENTIALS:"use-credentials"};
goog.net.ImageLoader.ImageRequest_;
goog.net.ImageLoader.IMAGE_LOAD_EVENTS_ = [goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("11") ? goog.net.EventType.READY_STATE_CHANGE : goog.events.EventType.LOAD, goog.net.EventType.ABORT, goog.net.EventType.ERROR];
goog.net.ImageLoader.prototype.addImage = function(id, image, opt_corsRequestType) {
  var src = goog.isString(image) ? image : image.src;
  if (src) {
    this.imageIdToRequestMap_[id] = {src:src, corsRequestType:goog.isDef(opt_corsRequestType) ? opt_corsRequestType : null};
  }
};
goog.net.ImageLoader.prototype.removeImage = function(id) {
  delete this.imageIdToRequestMap_[id];
  var image = this.imageIdToImageMap_[id];
  if (image) {
    delete this.imageIdToImageMap_[id];
    this.handler_.unlisten(image, goog.net.ImageLoader.IMAGE_LOAD_EVENTS_, this.onNetworkEvent_);
    if (goog.object.isEmpty(this.imageIdToImageMap_) && goog.object.isEmpty(this.imageIdToRequestMap_)) {
      this.dispatchEvent(goog.net.EventType.COMPLETE);
    }
  }
};
goog.net.ImageLoader.prototype.start = function() {
  var imageIdToRequestMap = this.imageIdToRequestMap_;
  goog.array.forEach(goog.object.getKeys(imageIdToRequestMap), function(id) {
    var imageRequest = imageIdToRequestMap[id];
    if (imageRequest) {
      delete imageIdToRequestMap[id];
      this.loadImage_(imageRequest, id);
    }
  }, this);
};
goog.net.ImageLoader.prototype.loadImage_ = function(imageRequest, id) {
  if (this.isDisposed()) {
    return;
  }
  var image;
  if (this.parent_) {
    var dom = goog.dom.getDomHelper(this.parent_);
    image = dom.createDom(goog.dom.TagName.IMG);
  } else {
    image = new Image;
  }
  if (imageRequest.corsRequestType) {
    image.crossOrigin = imageRequest.corsRequestType;
  }
  this.handler_.listen(image, goog.net.ImageLoader.IMAGE_LOAD_EVENTS_, this.onNetworkEvent_);
  this.imageIdToImageMap_[id] = image;
  image.id = id;
  image.src = imageRequest.src;
};
goog.net.ImageLoader.prototype.onNetworkEvent_ = function(evt) {
  var image = (evt.currentTarget);
  if (!image) {
    return;
  }
  if (evt.type == goog.net.EventType.READY_STATE_CHANGE) {
    if (image.readyState == goog.net.EventType.COMPLETE) {
      evt.type = goog.events.EventType.LOAD;
    } else {
      return;
    }
  }
  if (typeof image.naturalWidth == "undefined") {
    if (evt.type == goog.events.EventType.LOAD) {
      image.naturalWidth = image.width;
      image.naturalHeight = image.height;
    } else {
      image.naturalWidth = 0;
      image.naturalHeight = 0;
    }
  }
  this.dispatchEvent({type:evt.type, target:image});
  if (this.isDisposed()) {
    return;
  }
  this.removeImage(image.id);
};
goog.net.ImageLoader.prototype.disposeInternal = function() {
  delete this.imageIdToRequestMap_;
  delete this.imageIdToImageMap_;
  goog.dispose(this.handler_);
  goog.net.ImageLoader.superClass_.disposeInternal.call(this);
};
goog.provide("acgraph.vector.Renderer");
goog.require("acgraph.math.Rect");
goog.require("goog.dom");
goog.require("goog.net.ImageLoader");
acgraph.vector.Renderer = function() {
  this.textBoundsCache = {};
  this.settingsAffectingSize = ["fontStyle", "fontVariant", "fontFamily", "fontSize", "fontWeight", "letterSpacing", "decoration"];
};
goog.addSingletonGetter(acgraph.vector.Renderer);
acgraph.vector.Renderer.prototype.getSpaceBounds = function(style) {
  var bounds;
  if (this.isInBoundsCache(" ", style)) {
    bounds = this.textBounds(" ", style);
  } else {
    var boundsStringWithSpace = this.measure("a a", style);
    var boundsStringWithoutSpace = this.measure("aa", style);
    var width = boundsStringWithSpace.width - boundsStringWithoutSpace.width;
    bounds = new acgraph.math.Rect(0, boundsStringWithSpace.top, width, boundsStringWithSpace.height);
    this.textBounds(" ", style, bounds);
  }
  return bounds;
};
acgraph.vector.Renderer.prototype.getEmptyStringBounds = function(style) {
  var bounds;
  if (this.isInBoundsCache("", style)) {
    bounds = this.textBounds("", style);
  } else {
    var boundsStringWithSpace = this.measure("a", style);
    bounds = new acgraph.math.Rect(0, boundsStringWithSpace.top, 0, boundsStringWithSpace.height);
    this.textBounds("", style, bounds);
  }
  return bounds;
};
acgraph.vector.Renderer.prototype.getStyleHash_ = function(value) {
  var hash = "";
  for (var j = 0, l = this.settingsAffectingSize.length;j < l;j++) {
    var prop = value[this.settingsAffectingSize[j]];
    if (goog.isDef(prop)) {
      hash += prop + "|";
    }
  }
  return hash;
};
acgraph.vector.Renderer.prototype.textBounds = function(text, style, opt_bounds) {
  var boundsCache = this.textBoundsCache;
  var styleHash = this.getStyleHash_(style);
  var styleCache = boundsCache[styleHash];
  if (!styleCache) {
    styleCache = boundsCache[styleHash] = {};
  }
  var textBoundsCache = styleCache[text];
  return textBoundsCache ? textBoundsCache : styleCache[text] = opt_bounds ? opt_bounds : this.measure(text, style);
};
acgraph.vector.Renderer.prototype.isInBoundsCache = function(text, style) {
  var boundsCache = this.textBoundsCache;
  var styleHash = this.getStyleHash_(style);
  var styleCache = boundsCache[styleHash];
  return !!(styleCache && styleCache[text]);
};
acgraph.vector.Renderer.prototype.saveGradientAngle = function(sourceAngle, bounds) {
  var largeSide;
  var smallerSide;
  var sideRatio;
  sourceAngle = goog.math.standardAngle(sourceAngle);
  if (bounds.height == bounds.width) {
    return sourceAngle;
  } else {
    if (bounds.height < bounds.width) {
      largeSide = bounds.width;
      smallerSide = bounds.height;
      sideRatio = smallerSide / largeSide;
    } else {
      largeSide = bounds.height;
      smallerSide = bounds.width;
      sideRatio = largeSide / smallerSide;
    }
  }
  var b = largeSide / 2;
  var a = Math.tan(goog.math.toRadians(sourceAngle)) * b;
  var targetAngle = goog.math.toDegrees(Math.atan(a / b * sideRatio));
  if (sourceAngle > 90 && sourceAngle <= 270) {
    targetAngle = 180 + targetAngle;
  } else {
    if (sourceAngle > 270 && sourceAngle <= 360) {
      targetAngle = 360 + targetAngle;
    }
  }
  return targetAngle % 360;
};
acgraph.vector.Renderer.prototype.setId = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setDisableStrokeScaling = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setVisible = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setTitle = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setDesc = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setAttributes = goog.abstractMethod;
acgraph.vector.Renderer.prototype.getAttribute = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createStageElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setStageSize = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createDefsElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createLinearGradientElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createRadialGradientElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.appendChild = function(parent, child) {
  goog.dom.appendChild(parent, child);
};
acgraph.vector.Renderer.prototype.insertChildAt = function(parent, child, index) {
  goog.dom.insertChildAt(parent, child, index);
};
acgraph.vector.Renderer.prototype.getParent = function(node) {
  return goog.dom.getParentElement(node);
};
acgraph.vector.Renderer.prototype.removeNode = function(element) {
  goog.dom.removeNode(element);
};
acgraph.vector.Renderer.prototype.createLayerElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setLayerSize = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createRectElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setRectProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createCircleElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setCircleProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createFillPatternElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setFillPatternProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createImageElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setImageProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createTextElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createTextSegmentElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createTextNode = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setTextPosition = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setTextProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setTextSegmentPosition = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setTextSegmentProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setCursorProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.needsAnotherBehaviourForCalcText = function() {
  return false;
};
acgraph.vector.Renderer.prototype.createPathElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setPathProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.createEllipseElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setEllipseProperties = goog.abstractMethod;
acgraph.vector.Renderer.prototype.applyFill = goog.abstractMethod;
acgraph.vector.Renderer.prototype.applyStroke = goog.abstractMethod;
acgraph.vector.Renderer.prototype.applyFillAndStroke = goog.abstractMethod;
acgraph.vector.Renderer.prototype.isImageLoading = function() {
  return false;
};
acgraph.vector.Renderer.prototype.getImageLoader = function() {
  if (!this.imageLoader_) {
    this.imageLoader_ = new goog.net.ImageLoader;
  }
  return this.imageLoader_;
};
acgraph.vector.Renderer.prototype.setTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setPathTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setImageTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setRectTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setEllipseTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setLayerTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setTextTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setPatternTransformation = goog.abstractMethod;
acgraph.vector.Renderer.prototype.needsReRenderOnParentTransformationChange = function() {
  return false;
};
acgraph.vector.Renderer.prototype.createClipElement = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setPointerEvents = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setClip = goog.abstractMethod;
acgraph.vector.Renderer.prototype.setLayerClip = goog.abstractMethod;
acgraph.vector.Renderer.prototype.needsReClipOnBoundsChange = function() {
  return false;
};
goog.provide("goog.cssom");
goog.provide("goog.cssom.CssRuleType");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.dom.TagName");
goog.cssom.CssRuleType = {STYLE:1, IMPORT:3, MEDIA:4, FONT_FACE:5, PAGE:6, NAMESPACE:7};
goog.cssom.getAllCssText = function(opt_styleSheet) {
  var styleSheet = opt_styleSheet || document.styleSheets;
  return (goog.cssom.getAllCss_(styleSheet, true));
};
goog.cssom.getAllCssStyleRules = function(opt_styleSheet) {
  var styleSheet = opt_styleSheet || document.styleSheets;
  return (goog.cssom.getAllCss_(styleSheet, false));
};
goog.cssom.getCssRulesFromStyleSheet = function(styleSheet) {
  var cssRuleList = null;
  try {
    cssRuleList = styleSheet.cssRules || styleSheet.rules;
  } catch (e) {
    if (e.code == 15) {
      e.styleSheet = styleSheet;
      throw e;
    }
  }
  return cssRuleList;
};
goog.cssom.getAllCssStyleSheets = function(opt_styleSheet, opt_includeDisabled) {
  var styleSheetsOutput = [];
  var styleSheet = opt_styleSheet || document.styleSheets;
  var includeDisabled = goog.isDef(opt_includeDisabled) ? opt_includeDisabled : false;
  if (styleSheet.imports && styleSheet.imports.length) {
    for (var i = 0, n = styleSheet.imports.length;i < n;i++) {
      goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets((styleSheet.imports[i])));
    }
  } else {
    if (styleSheet.length) {
      for (var i = 0, n = styleSheet.length;i < n;i++) {
        goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(styleSheet[i]));
      }
    } else {
      var cssRuleList = goog.cssom.getCssRulesFromStyleSheet((styleSheet));
      if (cssRuleList && cssRuleList.length) {
        for (var i = 0, n = cssRuleList.length, cssRule;i < n;i++) {
          cssRule = cssRuleList[i];
          if (cssRule.styleSheet) {
            goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(cssRule.styleSheet));
          }
        }
      }
    }
  }
  if ((styleSheet.type || styleSheet.rules || styleSheet.cssRules) && (!styleSheet.disabled || includeDisabled)) {
    styleSheetsOutput.push(styleSheet);
  }
  return styleSheetsOutput;
};
goog.cssom.getCssTextFromCssRule = function(cssRule) {
  var cssText = "";
  if (cssRule.cssText) {
    cssText = cssRule.cssText;
  } else {
    if (cssRule.style && cssRule.style.cssText && cssRule.selectorText) {
      var styleCssText = cssRule.style.cssText.replace(/\s*-closure-parent-stylesheet:\s*\[object\];?\s*/gi, "").replace(/\s*-closure-rule-index:\s*[\d]+;?\s*/gi, "");
      var thisCssText = cssRule.selectorText + " { " + styleCssText + " }";
      cssText = thisCssText;
    }
  }
  return cssText;
};
goog.cssom.getCssRuleIndexInParentStyleSheet = function(cssRule, opt_parentStyleSheet) {
  if (cssRule.style && cssRule.style["-closure-rule-index"]) {
    return cssRule.style["-closure-rule-index"];
  }
  var parentStyleSheet = opt_parentStyleSheet || goog.cssom.getParentStyleSheet(cssRule);
  if (!parentStyleSheet) {
    throw Error("Cannot find a parentStyleSheet.");
  }
  var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(parentStyleSheet);
  if (cssRuleList && cssRuleList.length) {
    for (var i = 0, n = cssRuleList.length, thisCssRule;i < n;i++) {
      thisCssRule = cssRuleList[i];
      if (thisCssRule == cssRule) {
        return i;
      }
    }
  }
  return -1;
};
goog.cssom.getParentStyleSheet = function(cssRule) {
  return cssRule.parentStyleSheet || cssRule.style && cssRule.style["-closure-parent-stylesheet"];
};
goog.cssom.replaceCssRule = function(cssRule, cssText, opt_parentStyleSheet, opt_index) {
  var parentStyleSheet = opt_parentStyleSheet || goog.cssom.getParentStyleSheet(cssRule);
  if (parentStyleSheet) {
    var index = Number(opt_index) >= 0 ? opt_index : goog.cssom.getCssRuleIndexInParentStyleSheet(cssRule, parentStyleSheet);
    if (index >= 0) {
      goog.cssom.removeCssRule(parentStyleSheet, index);
      goog.cssom.addCssRule(parentStyleSheet, cssText, index);
    } else {
      throw Error("Cannot proceed without the index of the cssRule.");
    }
  } else {
    throw Error("Cannot proceed without the parentStyleSheet.");
  }
};
goog.cssom.addCssRule = function(cssStyleSheet, cssText, opt_index) {
  var index = opt_index;
  if (index == undefined || index < 0) {
    var rules = goog.cssom.getCssRulesFromStyleSheet(cssStyleSheet);
    index = rules.length;
  }
  if (cssStyleSheet.insertRule) {
    cssStyleSheet.insertRule(cssText, index);
  } else {
    var matches = /^([^\{]+)\{([^\{]+)\}/.exec(cssText);
    if (matches.length == 3) {
      var selector = matches[1];
      var style = matches[2];
      cssStyleSheet.addRule(selector, style, index);
    } else {
      throw Error("Your CSSRule appears to be ill-formatted.");
    }
  }
};
goog.cssom.removeCssRule = function(cssStyleSheet, index) {
  if (cssStyleSheet.deleteRule) {
    cssStyleSheet.deleteRule(index);
  } else {
    cssStyleSheet.removeRule(index);
  }
};
goog.cssom.addCssText = function(cssText, opt_domHelper) {
  var document = opt_domHelper ? opt_domHelper.getDocument() : goog.dom.getDocument();
  var cssNode = document.createElement(goog.dom.TagName.STYLE);
  cssNode.type = "text/css";
  var head = document.getElementsByTagName(goog.dom.TagName.HEAD)[0];
  head.appendChild(cssNode);
  if (cssNode.styleSheet) {
    cssNode.styleSheet.cssText = cssText;
  } else {
    var cssTextNode = document.createTextNode(cssText);
    cssNode.appendChild(cssTextNode);
  }
  return cssNode;
};
goog.cssom.getFileNameFromStyleSheet = function(styleSheet) {
  var href = styleSheet.href;
  if (!href) {
    return null;
  }
  var matches = /([^\/\?]+)[^\/]*$/.exec(href);
  var filename = matches[1];
  return filename;
};
goog.cssom.getAllCss_ = function(styleSheet, isTextOutput) {
  var cssOut = [];
  var styleSheets = goog.cssom.getAllCssStyleSheets(styleSheet);
  for (var i = 0;styleSheet = styleSheets[i];i++) {
    var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(styleSheet);
    if (cssRuleList && cssRuleList.length) {
      var ruleIndex = 0;
      for (var j = 0, n = cssRuleList.length, cssRule;j < n;j++) {
        cssRule = cssRuleList[j];
        if (isTextOutput && !cssRule.href) {
          var res = goog.cssom.getCssTextFromCssRule(cssRule);
          cssOut.push(res);
        } else {
          if (!cssRule.href) {
            if (cssRule.style) {
              if (!cssRule.parentStyleSheet) {
                cssRule.style["-closure-parent-stylesheet"] = styleSheet;
              }
              cssRule.style["-closure-rule-index"] = isTextOutput ? undefined : ruleIndex;
            }
            cssOut.push(cssRule);
          }
        }
        if (!isTextOutput) {
          ruleIndex++;
        }
      }
    }
  }
  return isTextOutput ? cssOut.join(" ") : cssOut;
};
goog.provide("acgraph.vector.vml.Renderer");
goog.require("acgraph.math.Coordinate");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.LinearGradient");
goog.require("acgraph.vector.Renderer");
goog.require("acgraph.vector.vml.RadialGradient");
goog.require("goog.array");
goog.require("goog.color");
goog.require("goog.cssom");
goog.require("goog.dom");
goog.require("goog.object");
acgraph.vector.vml.Renderer = function() {
  goog.base(this);
  var doc = goog.dom.getDocument();
  if (!this.isVMLClassDefined()) {
    doc.createStyleSheet().addRule("." + acgraph.vector.vml.Renderer.VML_CLASS_, "behavior:url(#default#VML)");
  }
  try {
    if (!doc.namespaces[acgraph.vector.vml.Renderer.VML_PREFIX_]) {
      doc.namespaces.add(acgraph.vector.vml.Renderer.VML_PREFIX_, acgraph.vector.vml.Renderer.VML_NS_);
    }
    this.createVMLElement_ = function(tagName) {
      return goog.dom.createDom(acgraph.vector.vml.Renderer.VML_PREFIX_ + ":" + tagName, {"class":acgraph.vector.vml.Renderer.VML_CLASS_});
    };
  } catch (e) {
    this.createVMLElement_ = function(tagName) {
      return goog.dom.createDom(acgraph.vector.vml.Renderer.VML_PREFIX_ + ":" + tagName, {"class":acgraph.vector.vml.Renderer.VML_CLASS_, "xmlns":"urn:schemas-microsoft.com:vml"});
    };
  }
};
goog.inherits(acgraph.vector.vml.Renderer, acgraph.vector.Renderer);
goog.addSingletonGetter(acgraph.vector.vml.Renderer);
acgraph.vector.vml.Renderer.VML_NS_ = "urn:schemas-microsoft-com:vml";
acgraph.vector.vml.Renderer.VML_PREFIX_ = "any_vml";
acgraph.vector.vml.Renderer.VML_CLASS_ = "any_vml";
acgraph.vector.vml.Renderer.VML_IMPORT_ = "#default#VML";
acgraph.vector.vml.Renderer.IE8_MODE = document.documentMode && document.documentMode >= 8;
acgraph.vector.vml.Renderer.COORD_MULTIPLIER_ = 100;
acgraph.vector.vml.Renderer.SHIFT_ = 0;
acgraph.vector.vml.Renderer.prototype.measurement_ = null;
acgraph.vector.vml.Renderer.prototype.measurementText_ = null;
acgraph.vector.vml.Renderer.measurementSimpleText_ = null;
acgraph.vector.vml.Renderer.prototype.virtualBaseLine_ = null;
acgraph.vector.vml.Renderer.prototype.measurementVMLShape_ = null;
acgraph.vector.vml.Renderer.prototype.measurementVMLTextPath_ = null;
acgraph.vector.vml.Renderer.prototype.measurementImage_ = null;
acgraph.vector.vml.Renderer.prototype.createMeasurement_ = function() {
  this.measurementVMLShape_ = this.createTextSegmentElement();
  this.setPositionAndSize_(this.measurementVMLShape_, 0, 0, 1, 1);
  this.measurementVMLShape_.style["display"] = "none";
  this.setAttributes_(this.measurementVMLShape_, {"filled":"true", "fillcolor":"black", "stroked":"false", "path":"m0,0 l1,0 e"});
  goog.dom.appendChild(document.body, this.measurementVMLShape_);
  this.measurement_ = goog.dom.createDom(goog.dom.TagName.DIV);
  this.measurementText_ = goog.dom.createDom(goog.dom.TagName.SPAN);
  this.virtualBaseLine_ = goog.dom.createDom(goog.dom.TagName.SPAN);
  goog.dom.appendChild(document.body, this.measurement_);
  goog.dom.appendChild(this.measurement_, this.virtualBaseLine_);
  goog.dom.appendChild(this.measurement_, this.measurementText_);
  goog.style.setStyle(this.measurement_, {"position":"absolute", "visibility":"hidden", "left":0, "top":0});
  goog.style.setStyle(this.virtualBaseLine_, {"font-size":"0px", "border":"0 solid"});
  this.virtualBaseLine_.innerHTML = "a";
  this.measurementSimpleText_ = goog.dom.createDom(goog.dom.TagName.SPAN);
  goog.dom.appendChild(this.measurement_, this.measurementSimpleText_);
  goog.style.setStyle(this.measurementSimpleText_, {"font-size":"0px", "border":"0 solid"});
  this.measurementSimpleText_.innerHTML = "a";
  this.measurementImage_ = goog.dom.createDom(goog.dom.TagName.IMG);
  goog.style.setStyle(this.measurementImage_, {"position":"absolute", "left":0, "top":0});
  goog.dom.appendChild(this.measurement_, this.measurementImage_);
  this.measurementGroupNode_ = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.appendChild(this.measurement_, this.measurementGroupNode_);
};
acgraph.vector.vml.Renderer.prototype.measuringImage = function(src) {
  if (!this.measurement_) {
    this.createMeasurement_();
  }
  this.setAttribute_(this.measurementImage_, "src", src);
  return goog.style.getBounds(this.measurementImage_);
};
acgraph.vector.vml.Renderer.prototype.measuringSimpleText = function(text, segmentStyle, textStyle) {
  if (!this.measurement_) {
    this.createMeasurement_();
  }
  this.measurementSimpleText_.style.cssText = "";
  if (textStyle["fontStyle"]) {
    goog.style.setStyle(this.measurementSimpleText_, "font-style", textStyle["fontStyle"]);
  }
  if (textStyle["fontVariant"]) {
    goog.style.setStyle(this.measurementSimpleText_, "font-variant", textStyle["fontVariant"]);
  }
  if (textStyle["fontFamily"]) {
    goog.style.setStyle(this.measurementSimpleText_, "font-family", textStyle["fontFamily"]);
  }
  if (textStyle["fontSize"]) {
    goog.style.setStyle(this.measurementSimpleText_, "font-size", textStyle["fontSize"]);
  }
  if (textStyle["fontWeight"]) {
    goog.style.setStyle(this.measurementSimpleText_, "font-weight", textStyle["fontWeight"]);
  }
  if (textStyle["letterSpacing"]) {
    goog.style.setStyle(this.measurementSimpleText_, "letter-spacing", textStyle["letterSpacing"]);
  }
  if (textStyle["decoration"]) {
    goog.style.setStyle(this.measurementSimpleText_, "text-decoration", textStyle["decoration"]);
  }
  if (textStyle["textIndent"]) {
    goog.style.setStyle(this.measurementSimpleText_, "text-indent", textStyle["textIndent"]);
  }
  if (textStyle["textWrap"] && textStyle["width"] && textStyle["textWrap"] == acgraph.vector.Text.TextWrap.BY_LETTER) {
    goog.style.setStyle(this.measurementSimpleText_, "word-break", "break-all");
  } else {
    goog.style.setStyle(this.measurementSimpleText_, "white-space", "nowrap");
  }
  if (textStyle["width"]) {
    goog.style.setStyle(this.measurementSimpleText_, "width", textStyle["width"]);
  }
  goog.style.setStyle(this.measurement_, {"left":0, "top":0, "width":"1px", height:"1px"});
  goog.style.setStyle(this.measurementSimpleText_, {"border":"0 solid", "position":"absolute", "left":0, "top":0});
  this.measurementSimpleText_.innerHTML = text;
  var boundsTargetText = goog.style.getBounds(this.measurementSimpleText_);
  this.measurementSimpleText_.innerHTML = "";
  return boundsTargetText;
};
acgraph.vector.vml.Renderer.prototype.measure = function(text, style) {
  if (text == "") {
    return new acgraph.math.Rect(0, 0, 0, 0);
  }
  if (!this.measurement_) {
    this.createMeasurement_();
  }
  goog.dom.removeNode(this.measurementVMLTextPath_);
  this.measurementVMLTextPath_ = (this.createTextNode(""));
  goog.dom.appendChild(this.measurementVMLShape_, this.measurementVMLTextPath_);
  var spaceWidth = null;
  var additionWidth = 0;
  if (goog.string.isSpace(text)) {
    return this.getSpaceBounds(style);
  } else {
    if (goog.string.startsWith(text, " ")) {
      additionWidth += spaceWidth = this.getSpaceBounds(style).width;
    }
    if (goog.string.endsWith(text, " ")) {
      additionWidth += spaceWidth || this.getSpaceBounds(style).width;
    }
  }
  this.removeStyle_(this.measurementText_.style, "font-style");
  this.removeStyle_(this.measurementText_.style, "font-variant");
  this.removeStyle_(this.measurementText_.style, "font-family");
  this.removeStyle_(this.measurementText_.style, "font-size");
  this.removeStyle_(this.measurementText_.style, "font-weight");
  this.removeStyle_(this.measurementText_.style, "letter-spacing");
  this.removeStyle_(this.measurementText_.style, "text-decoration");
  this.measurementText_.style.cssText = "";
  if (style.fontStyle) {
    goog.style.setStyle(this.measurementText_, "font-style", style["fontStyle"]);
    goog.style.setStyle(this.measurementVMLTextPath_, "font-style", style["fontStyle"]);
  }
  if (style.fontVariant) {
    goog.style.setStyle(this.measurementText_, "font-variant", style["fontVariant"]);
    goog.style.setStyle(this.measurementVMLTextPath_, "font-variant", style["fontVariant"]);
  }
  if (style.fontFamily) {
    goog.style.setStyle(this.measurementText_, "font-family", style["fontFamily"]);
    goog.style.setStyle(this.measurementVMLTextPath_, "font-family", style["fontFamily"]);
  }
  if (style.fontSize) {
    goog.style.setStyle(this.measurementText_, "font-size", style["fontSize"]);
    goog.style.setStyle(this.measurementVMLTextPath_, "font-size", style["fontSize"]);
  }
  if (style.fontWeight) {
    goog.style.setStyle(this.measurementText_, "font-weight", style["fontWeight"]);
    goog.style.setStyle(this.measurementVMLTextPath_, "font-weight", style["fontWeight"]);
  } else {
    goog.style.setStyle(this.measurementText_, "font-weight", "normal");
    goog.style.setStyle(this.measurementVMLTextPath_, "font-weight", "normal");
  }
  if (style.letterSpacing) {
    goog.style.setStyle(this.measurementText_, "letter-spacing", style["letterSpacing"]);
    this.measurementVMLTextPath_.style["v-text-spacing"] = style["letterSpacing"];
  }
  if (style.decoration) {
    goog.style.setStyle(this.measurementText_, "text-decoration", style["decoration"]);
    goog.style.setStyle(this.measurementVMLTextPath_, "text-decoration", style["decoration"]);
  }
  goog.style.setStyle(this.measurementText_, "border", "0 solid");
  this.setAttribute_(this.measurementVMLTextPath_, "string", text);
  var width = goog.style.getBounds(this.measurementVMLShape_).width;
  goog.style.setStyle(this.measurement_, {"left":0, "top":0, "width":"auto", "height":"auto"});
  this.measurementText_.innerHTML = text;
  var boundsMicroText = goog.style.getBounds(this.virtualBaseLine_);
  goog.style.setPosition(this.measurement_, 0, -(boundsMicroText.top + boundsMicroText.height));
  var size = goog.style.getFontSize(this.measurementText_);
  var boundsTargetText = goog.style.getBounds(this.measurementText_);
  boundsTargetText.width = width + additionWidth;
  boundsTargetText.left = boundsTargetText.left - 1;
  this.measurementText_.innerHTML = "";
  return boundsTargetText;
};
acgraph.vector.vml.Renderer.prototype.measureElement = function(element) {
  if (!this.measurement_) {
    this.createMeasurement_();
  }
  if (goog.isString(element)) {
    this.measurementGroupNode_.innerHTML = element;
  } else {
    goog.dom.appendChild(this.measurementGroupNode_, element.cloneNode(true));
  }
  var bounds = goog.style.getBounds(this.measurementGroupNode_);
  this.measurementGroupNode_.innerHTML = "";
  return bounds;
};
acgraph.vector.vml.Renderer.prototype.setAttribute_ = function(element, key, value) {
  if (acgraph.vector.vml.Renderer.IE8_MODE) {
    element[key] = value;
  } else {
    element.setAttribute(key, value);
  }
};
acgraph.vector.vml.Renderer.prototype.setAttributes_ = function(element, attrs) {
  goog.object.forEach(attrs, function(val, key) {
    this.setAttribute_(element, key, val);
  }, this);
};
acgraph.vector.vml.Renderer.prototype.removeStyle_ = function(style, key) {
  if (!style[key]) {
    return;
  }
  style["cssText"] = style["cssText"].replace(new RegExp("(^|; )(" + key + ": [^;]*)(;|$)", "ig"), ";");
};
acgraph.vector.vml.Renderer.prototype.removeAttribute_ = function(element, key) {
  element.removeAttribute(key);
};
acgraph.vector.vml.Renderer.prototype.toCssSize_ = function(size) {
  return goog.isString(size) && goog.string.endsWith(size, "%") ? parseFloat(size) + "%" : parseFloat(size.toString()) + "px";
};
acgraph.vector.vml.Renderer.prototype.toPosPx_ = function(number) {
  return this.toPosCoord_(number).toFixed(6) + "px";
};
acgraph.vector.vml.Renderer.prototype.toPosCoord_ = function(number) {
  return Math.round((parseFloat(number.toString()) - acgraph.vector.vml.Renderer.SHIFT_) * acgraph.vector.vml.Renderer.COORD_MULTIPLIER_);
};
acgraph.vector.vml.Renderer.prototype.toSizePx_ = function(number) {
  return this.toSizeCoord_(number) + "px";
};
acgraph.vector.vml.Renderer.prototype.toSizeCoord_ = function(number) {
  return Math.round(parseFloat(number.toString()) * acgraph.vector.vml.Renderer.COORD_MULTIPLIER_);
};
acgraph.vector.vml.Renderer.prototype.setPositionAndSize_ = function(element, x, y, width, height) {
  this.setCoordSize(element);
  this.setAttributes_(element["style"], {"position":"absolute", "left":this.toCssSize_(x), "top":this.toCssSize_(y), "width":this.toCssSize_(width), "height":this.toCssSize_(height)});
};
acgraph.vector.vml.Renderer.prototype.getVmlPath_ = function(path, opt_transformed) {
  if (path.isEmpty()) {
    return null;
  }
  var list = [];
  var func = opt_transformed ? path.forEachTransformedSegment : path.forEachSegment;
  func.call(path, function(segment, args) {
    switch(segment) {
      case acgraph.vector.PathBase.Segment.MOVETO:
        list.push("m");
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(args, this.toSizeCoord_), list);
        break;
      case acgraph.vector.PathBase.Segment.LINETO:
        list.push("l");
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(args, this.toSizeCoord_), list);
        break;
      case acgraph.vector.PathBase.Segment.CURVETO:
        list.push("c");
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(args, this.toSizeCoord_), list);
        break;
      case acgraph.vector.PathBase.Segment.CLOSE:
        list.push("x");
        break;
      case acgraph.vector.PathBase.Segment.ARCTO:
        var toAngle = args[2] + args[3];
        var cx = this.toSizeCoord_(args[4] - goog.math.angleDx(toAngle, args[0]));
        var cy = this.toSizeCoord_(args[5] - goog.math.angleDy(toAngle, args[1]));
        var rx = this.toSizeCoord_(args[0]);
        var ry = this.toSizeCoord_(args[1]);
        var fromAngle = Math.round(args[2] * -65536);
        var extent = Math.round(args[3] * -65536);
        list.push("ae", cx, cy, rx, ry, fromAngle, extent);
        break;
    }
  }, this);
  return list.join(" ");
};
acgraph.vector.vml.Renderer.prototype.createVMLElement_;
acgraph.vector.vml.Renderer.prototype.isVMLClassDefined = function() {
  return !!goog.array.find(goog.cssom.getAllCssStyleRules(), function(cssRule) {
    return cssRule.selectorText === "." + acgraph.vector.vml.Renderer.VML_CLASS_;
  });
};
acgraph.vector.vml.Renderer.prototype.setId = function(element, id) {
  this.setIdInternal(element.domElement(), id);
};
acgraph.vector.vml.Renderer.prototype.setIdInternal = function(element, id) {
  if (element) {
    if (id) {
      this.setAttribute_(element, "id", id);
    } else {
      this.removeAttribute_(element, "id");
    }
  }
};
acgraph.vector.vml.Renderer.prototype.setTitle = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.setDesc = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.setAttributes = function(element, attrs) {
  var domElement = element.domElement();
  if (domElement && goog.isObject(attrs)) {
    for (var key in attrs) {
      var value = attrs[key];
      if (goog.isNull(value)) {
        this.removeAttribute_(domElement, key);
      } else {
        this.setAttribute_(domElement, key, (value));
      }
    }
  }
};
acgraph.vector.vml.Renderer.prototype.getAttribute = function(element, key) {
  return element ? element.getAttribute(key) : void 0;
};
acgraph.vector.vml.Renderer.prototype.getUserSpaceOnUseGradientVector_ = function(angle, bounds) {
  var angleTransform = angle % 90;
  var radAngle = goog.math.toRadians(angle);
  var dx = 1;
  var dy = 1;
  var centerX = bounds.left + bounds.width / 2;
  var centerY = bounds.top + bounds.height / 2;
  var swap = Math.sin(radAngle) < 0 || angle == 180 || angle == 360;
  if (angle == 90 || angle == 270) {
    angleTransform += 1E-6;
  }
  if (angle != 180 && (Math.tan(radAngle) < 0 || angle == 90 || angle == 270)) {
    dx = -1;
    angleTransform = 90 - angleTransform;
  }
  var radAngleTransform = goog.math.toRadians(angleTransform);
  var tanAngle = Math.tan(radAngleTransform);
  var halfLengthVector = Math.sin(radAngleTransform) * (bounds.height / 2 - tanAngle * bounds.width / 2) + Math.sqrt(Math.pow(bounds.width / 2, 2) * (1 + Math.pow(tanAngle, 2)));
  dx *= Math.cos(radAngleTransform) * halfLengthVector;
  dy *= Math.sin(radAngleTransform) * halfLengthVector;
  if (swap) {
    dx = -dx;
    dy = -dy;
  }
  return {p1:new acgraph.math.Coordinate(Math.round(centerX - dx), Math.round(centerY + dy)), p2:new acgraph.math.Coordinate(Math.round(centerX + dx), Math.round(centerY - dy))};
};
acgraph.vector.vml.Renderer.prototype.getOffsetOfPointRelativeGradientVector_ = function(point, vector) {
  var baseNormal_x, baseNormal_y;
  if (vector.p1.x == vector.p2.x) {
    baseNormal_x = vector.p1.x;
    baseNormal_y = point.y;
  } else {
    if (vector.p1.y == vector.p2.y) {
      baseNormal_x = point.x;
      baseNormal_y = vector.p1.y;
    } else {
      baseNormal_x = (vector.p1.x * Math.pow(vector.p2.y - vector.p1.y, 2) + point.x * Math.pow(vector.p2.x - vector.p1.x, 2) + (vector.p2.x - vector.p1.x) * (vector.p2.y - vector.p1.y) * (point.y - vector.p1.y)) / (Math.pow(vector.p2.y - vector.p1.y, 2) + Math.pow(vector.p2.x - vector.p1.x, 2));
      baseNormal_y = (vector.p2.x - vector.p1.x) * (point.x - baseNormal_x) / (vector.p2.y - vector.p1.y) + point.y;
    }
  }
  var baseNormal = new acgraph.math.Coordinate(baseNormal_x, baseNormal_y);
  var gradientVectorDirection = [goog.math.clamp(vector.p1.x - vector.p2.x, -1, 1), goog.math.clamp(vector.p1.y - vector.p2.y, -1, 1)];
  var outsideOfStartGradientVectorPoint = [goog.math.clamp(vector.p1.x - baseNormal.x, -1, 1), goog.math.clamp(vector.p1.y - baseNormal.y, -1, 1)];
  var outsideOfEndGradientVectorPoint = [goog.math.clamp(vector.p2.x - baseNormal.x, -1, 1), goog.math.clamp(vector.p2.y - baseNormal.y, -1, 1)];
  var outsideOfVector;
  if (gradientVectorDirection[0] == 0) {
    outsideOfVector = (outsideOfStartGradientVectorPoint[1] + outsideOfEndGradientVectorPoint[1]) * gradientVectorDirection[1];
  } else {
    outsideOfVector = (outsideOfStartGradientVectorPoint[0] + outsideOfEndGradientVectorPoint[0]) * gradientVectorDirection[0];
  }
  return outsideOfVector < 0 ? -acgraph.math.Coordinate.distance(vector.p1, baseNormal) : acgraph.math.Coordinate.distance(vector.p1, baseNormal);
};
acgraph.vector.vml.Renderer.prototype.userSpaceOnUse_ = function(keys, bounds, angle, shapeBounds) {
  var shapeGradientVector = this.getUserSpaceOnUseGradientVector_(angle, shapeBounds);
  var shapeGradientVectorLength = goog.math.Coordinate.distance(shapeGradientVector.p1, shapeGradientVector.p2);
  var gradientVector = this.getUserSpaceOnUseGradientVector_(angle, bounds);
  var gradientVectorLength = goog.math.Coordinate.distance(gradientVector.p1, gradientVector.p2);
  var offsetStartShapeVectorPoint = this.getOffsetOfPointRelativeGradientVector_(shapeGradientVector.p1, gradientVector);
  var offsetEndShapeVectorPoint = this.getOffsetOfPointRelativeGradientVector_(shapeGradientVector.p2, gradientVector);
  var stopFirst = {"offset":Math.round(offsetStartShapeVectorPoint / gradientVectorLength * 100) / 100, "color":"", "opacity":1};
  var stopLast = {"offset":Math.round(offsetEndShapeVectorPoint / gradientVectorLength * 100) / 100, "color":"", "opacity":1};
  var keysForShape = [];
  keysForShape.toString = function() {
    var result = "\n";
    for (var i = 0, len = this.length;i < len;i++) {
      result += "offset: " + this[i]["offset"] + "; color: " + this[i]["color"] + "; opacity: " + this[i]["opacity"] + "\n";
    }
    return result;
  };
  var stopPrev;
  var stopNext;
  var offsetStopPrev;
  var offsetStopNext;
  keysForShape.push(stopFirst);
  for (var i = 0;i < keys.length;i++) {
    var k = keys[i];
    k["color"] = goog.color.parse(k["color"]).hex;
    if (k["offset"] <= stopFirst["offset"]) {
      stopPrev = {"offset":k["offset"], "color":k["color"], "opacity":k["opacity"]};
    } else {
      if (k["offset"] > stopFirst["offset"] && k["offset"] < stopLast["offset"]) {
        keysForShape.push({"offset":k["offset"], "color":k["color"], "opacity":k["opacity"]});
      } else {
        if (k["offset"] >= stopLast["offset"] && !stopNext) {
          stopNext = {"offset":k["offset"], "color":k["color"], "opacity":k["opacity"]};
        }
      }
    }
  }
  keysForShape.push(stopLast);
  var offset1 = 1;
  var offset2 = 1;
  if (keysForShape.length > 2) {
    if (!stopPrev) {
      stopPrev = keysForShape[1];
    }
    offsetStopPrev = gradientVectorLength * stopPrev["offset"];
    var offsetStopNextAfterFirst = gradientVectorLength * keysForShape[1]["offset"];
    var lengthBetween1 = Math.abs(offsetStopNextAfterFirst - offsetStopPrev);
    var startColor1 = goog.color.hexToRgb(stopPrev["color"].toString());
    var endColor1 = goog.color.hexToRgb(keysForShape[1]["color"].toString());
    offset1 -= lengthBetween1 == 0 ? 0 : Math.abs(offsetStartShapeVectorPoint - offsetStopPrev) / lengthBetween1;
    stopFirst["color"] = goog.color.rgbArrayToHex(goog.color.blend(startColor1, endColor1, offset1));
    if (!stopNext) {
      stopNext = keysForShape[keysForShape.length - 2];
    }
    offsetStopNext = gradientVectorLength * stopNext["offset"];
    var offsetStopPenultimate = gradientVectorLength * keysForShape[keysForShape.length - 2]["offset"];
    var lengthBetween2 = Math.abs(offsetStopPenultimate - offsetStopNext);
    var startColor2 = goog.color.hexToRgb(keysForShape[keysForShape.length - 2]["color"].toString());
    var endColor2 = goog.color.hexToRgb(stopNext["color"].toString());
    offset2 -= lengthBetween2 == 0 ? 0 : Math.abs(offsetEndShapeVectorPoint - offsetStopPenultimate) / lengthBetween2;
    stopLast["color"] = goog.color.rgbArrayToHex(goog.color.blend(startColor2, endColor2, offset2));
  } else {
    if (!stopPrev && stopNext["offset"] == 0) {
      stopPrev = stopNext;
    }
    if (!stopNext && stopPrev["offset"] == 1) {
      stopNext = stopPrev;
    }
    offsetStopPrev = gradientVectorLength * stopPrev["offset"];
    offsetStopNext = gradientVectorLength * stopNext["offset"];
    var startColor = goog.color.hexToRgb(stopPrev["color"].toString());
    var endColor = goog.color.hexToRgb(stopNext["color"].toString());
    var lengthBetween = Math.abs(offsetStopNext - offsetStopPrev);
    offset1 -= lengthBetween == 0 ? 0 : Math.abs(offsetStartShapeVectorPoint - offsetStopPrev) / lengthBetween;
    offset2 -= lengthBetween == 0 ? 0 : Math.abs(offsetEndShapeVectorPoint - offsetStopPrev) / lengthBetween;
    stopFirst["color"] = goog.color.rgbArrayToHex(goog.color.blend(startColor, endColor, offset1));
    stopLast["color"] = goog.color.rgbArrayToHex(goog.color.blend(startColor, endColor, offset2));
  }
  stopFirst["opacity"] = stopPrev["opacity"];
  stopLast["opacity"] = stopNext["opacity"];
  for (i = 0;i < keysForShape.length;i++) {
    if (i == 0) {
      keysForShape[i]["offset"] = 0;
    } else {
      if (i == keysForShape.length - 1) {
        keysForShape[i]["offset"] = 1;
      } else {
        keysForShape[i]["offset"] = Math.abs(offsetStartShapeVectorPoint - keysForShape[i]["offset"] * gradientVectorLength) / shapeGradientVectorLength;
      }
    }
  }
  return keysForShape;
};
acgraph.vector.vml.Renderer.prototype.createStageElement = function() {
  return goog.dom.createDom("div", {"style":"overflow:hidden;position:relative;"});
};
acgraph.vector.vml.Renderer.prototype.setStageSize = function(el, width, height) {
  this.setAttributes_(el["style"], {"width":this.toCssSize_(width), "height":this.toCssSize_(height)});
};
acgraph.vector.vml.Renderer.prototype.createDefsElement = function() {
  return goog.dom.createElement("div");
};
acgraph.vector.vml.Renderer.prototype.createLayerElement = function() {
  return goog.dom.createElement("div");
};
acgraph.vector.vml.Renderer.prototype.createImageElement = function() {
  return this.createVMLElement_("image");
};
acgraph.vector.vml.Renderer.prototype.createRectElement = function() {
  return this.createVMLElement_("shape");
};
acgraph.vector.vml.Renderer.prototype.createCircleElement = function() {
  return this.createVMLElement_("shape");
};
acgraph.vector.vml.Renderer.prototype.createPathElement = function() {
  return this.createVMLElement_("shape");
};
acgraph.vector.vml.Renderer.prototype.createEllipseElement = function() {
  return this.createVMLElement_("shape");
};
acgraph.vector.vml.Renderer.prototype.createLinearGradientElement = function() {
  return this.createVMLElement_("fill");
};
acgraph.vector.vml.Renderer.prototype.createShapeTypeElement = function() {
  return this.createVMLElement_("shapetype");
};
acgraph.vector.vml.Renderer.prototype.createFillElement = function() {
  return this.createVMLElement_("fill");
};
acgraph.vector.vml.Renderer.prototype.createStrokeElement = function() {
  return this.createVMLElement_("stroke");
};
acgraph.vector.vml.Renderer.prototype.createFillPatternElement = function() {
  return goog.dom.createElement("div");
};
acgraph.vector.vml.Renderer.prototype.setFillPatternProperties = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.setPatternTransformation = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.setLayerSize = function(layer) {
  this.setAttributes_(layer.domElement()["style"], {"position":"absolute", "left":this.toCssSize_(0), "top":this.toCssSize_(0), "width":this.toCssSize_(1), "height":this.toCssSize_(1)});
};
acgraph.vector.vml.Renderer.prototype.setCoordSize = function(element) {
  this.setAttribute_(element, "coordsize", this.toSizeCoord_(1) + " " + this.toSizeCoord_(1));
};
acgraph.vector.vml.Renderer.prototype.setImageProperties = function(element) {
  var bounds = element.getBoundsWithoutTransform();
  var domElement = element.domElement();
  var src = (element.src() || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
  var align = element.align(), calcX, calcY, calcWidth, calcHeight;
  if (align == acgraph.vector.Image.Align.NONE) {
    calcX = bounds.left;
    calcY = bounds.top;
    calcWidth = bounds.width;
    calcHeight = bounds.height;
  } else {
    var realImageBounds = this.measuringImage(src);
    var widthRate = realImageBounds.width / bounds.width;
    var heightRate = realImageBounds.height / bounds.height;
    var meet = element.fittingMode() == acgraph.vector.Image.Fitting.MEET;
    var fitMode;
    if (widthRate > 1 && heightRate > 1 || widthRate < 1 && heightRate < 1) {
      fitMode = meet ? widthRate > heightRate : widthRate < heightRate;
    } else {
      fitMode = meet ? widthRate > 1 : widthRate < 1;
    }
    var baseRate = 1 / (fitMode ? widthRate : heightRate);
    calcWidth = realImageBounds.width * baseRate;
    calcHeight = realImageBounds.height * baseRate;
    switch(align) {
      case acgraph.vector.Image.Align.NONE:
        calcX = bounds.width;
        calcY = bounds.height;
        break;
      case acgraph.vector.Image.Align.X_MIN_Y_MIN:
        calcX = bounds.left;
        calcY = bounds.top;
        break;
      case acgraph.vector.Image.Align.X_MID_Y_MIN:
        calcX = bounds.left + bounds.width / 2 - calcWidth / 2;
        calcY = bounds.top;
        break;
      case acgraph.vector.Image.Align.X_MAX_Y_MIN:
        calcX = bounds.left + bounds.width - calcWidth;
        calcY = bounds.top;
        break;
      case acgraph.vector.Image.Align.X_MIN_Y_MID:
        calcX = bounds.left;
        calcY = bounds.top + bounds.height / 2 - calcHeight / 2;
        break;
      default:
      ;
      case acgraph.vector.Image.Align.X_MID_Y_MID:
        calcX = bounds.left + bounds.width / 2 - calcWidth / 2;
        calcY = bounds.top + bounds.height / 2 - calcHeight / 2;
        break;
      case acgraph.vector.Image.Align.X_MAX_Y_MID:
        calcX = bounds.left + bounds.width - calcWidth;
        calcY = bounds.top + bounds.height / 2 - calcHeight / 2;
        break;
      case acgraph.vector.Image.Align.X_MIN_Y_MAX:
        calcX = bounds.left;
        calcY = bounds.top + bounds.height - calcHeight;
        break;
      case acgraph.vector.Image.Align.X_MID_Y_MAX:
        calcX = bounds.left + bounds.width / 2 - calcWidth / 2;
        calcY = bounds.top + bounds.height - calcHeight;
        break;
      case acgraph.vector.Image.Align.X_MAX_Y_MAX:
        calcX = bounds.left + bounds.width - calcWidth;
        calcY = bounds.top + bounds.height - calcHeight;
        break;
    }
  }
  this.setAttributes_(domElement["style"], {"position":"absolute", "left":this.toCssSize_(calcX), "top":this.toCssSize_(calcY), "width":this.toCssSize_(calcWidth), "height":this.toCssSize_(calcHeight)});
  this.setAttribute_(domElement, "src", src);
  element.clip(bounds);
};
acgraph.vector.vml.Renderer.prototype.setRectProperties = function(rect) {
  var bounds = rect.getBoundsWithoutTransform();
  var element = rect.domElement();
  this.setPositionAndSize_(element, 0, 0, 1, 1);
  var left = bounds.left;
  var top = bounds.top;
  var right = left + bounds.width;
  var bottom = top + bounds.height;
  var points = [right, top, right, bottom, left, bottom, left, top];
  var transform = rect.getFullTransformation();
  if (transform && !transform.isIdentity()) {
    transform.transform(points, 0, points, 0, points.length / 2);
  }
  points = goog.array.map(points, this.toSizeCoord_);
  var pathData = ["m", points[6], points[7], "l"];
  acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, points, pathData);
  pathData.push("x");
  rect.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  rect.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
  this.setAttribute_(element, "path", pathData.join(" "));
};
acgraph.vector.vml.Renderer.prototype.setCircleProperties = function(circle) {
  this.setEllipseProperties(circle);
};
acgraph.vector.vml.Renderer.prototype.setEllipseProperties = function(ellipse) {
  var domElement = ellipse.domElement();
  this.setPositionAndSize_(domElement, 0, 0, 1, 1);
  var cx = (ellipse.centerX());
  var cy = (ellipse.centerY());
  var rx = (ellipse.radiusX());
  var ry = (ellipse.radiusY());
  var transform = ellipse.getFullTransformation();
  var list;
  if (transform && !transform.isIdentity()) {
    var curves = acgraph.math.arcToBezier(cx, cy, rx, ry, 0, 360, false);
    var len = curves.length;
    transform.transform(curves, 0, curves, 0, len / 2);
    list = ["m", this.toSizeCoord_(curves[len - 2]), this.toSizeCoord_(curves[len - 1]), "c"];
    acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(curves, this.toSizeCoord_), list);
  } else {
    list = ["ae", this.toSizeCoord_(cx), this.toSizeCoord_(cy), this.toSizeCoord_(rx), this.toSizeCoord_(ry), 0, Math.round(360 * -65536)];
  }
  list.push("x");
  ellipse.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  ellipse.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
  this.setAttribute_(domElement, "path", list.join(" "));
};
acgraph.vector.vml.Renderer.prototype.setPathProperties = function(path) {
  var element = path.domElement();
  this.setPositionAndSize_(element, 0, 0, 1, 1);
  var pathData = this.getVmlPath_(path, true);
  if (pathData) {
    this.setAttribute_(element, "path", pathData);
  } else {
    this.setAttribute_(element, "path", "M 0,0");
    this.removeAttribute_(element, "path");
  }
  path.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  path.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};
acgraph.vector.vml.Renderer.prototype.createTextSegmentElement = function() {
  var textSegmentDOMElement = this.createVMLElement_("shape");
  var path = this.createVMLElement_("path");
  path.setAttribute("textpathok", "t");
  goog.dom.appendChild(textSegmentDOMElement, path);
  return textSegmentDOMElement;
};
acgraph.vector.vml.Renderer.prototype.createTextElement = function() {
  return goog.dom.createElement("span");
};
acgraph.vector.vml.Renderer.prototype.createTextNode = function(text) {
  var textPath = this.createVMLElement_("textpath");
  textPath.setAttribute("on", "t");
  textPath.setAttribute("string", text);
  return textPath;
};
acgraph.vector.vml.Renderer.prototype.setCursorProperties = function(element, cursor) {
  var domElement = element.domElement();
  if (domElement) {
    domElement.style["cursor"] = cursor || "";
  }
};
acgraph.vector.vml.Renderer.prototype.setTextPosition = function(element) {
  var domElement = element.domElement();
  var domElementStyle = domElement["style"];
  var x, y;
  if (element.isComplex()) {
    y = element.calcY;
    if (element.getSegments().length) {
      y -= element.getSegments()[0].baseLine;
    }
    x = element.calcX;
    this.setAttributes_(domElementStyle, {"position":"absolute", "overflow":"visible", "left":this.toCssSize_(x), "top":this.toCssSize_(y)});
  } else {
    x = (element.x());
    y = (element.y());
    if (element.vAlign() && element.height() && element.height() > element.realHeigth) {
      if (element.vAlign() == acgraph.vector.Text.VAlign.MIDDLE) {
        y += element.height() / 2 - element.realHeigth / 2;
      }
      if (element.vAlign() == acgraph.vector.Text.VAlign.BOTTOM) {
        y += element.height() - element.realHeigth;
      }
    }
    this.setAttributes_(domElementStyle, {"position":"absolute", "overflow":"hidden", "left":this.toCssSize_(x), "top":this.toCssSize_(y)});
  }
};
acgraph.vector.vml.Renderer.prototype.setTextProperties = function(element) {
  var domElement = element.domElement();
  var domElementStyle = domElement["style"];
  domElement.style.cssText = "";
  if (element.isComplex()) {
    this.setAttributes_(domElementStyle, {"width":this.toCssSize_(1), "height":this.toCssSize_(1)});
    domElement.innerHTML = "";
  } else {
    var text = element.getSimpleText();
    if (text == null) {
      return;
    }
    var style = element.style();
    if (element.fontSize()) {
      goog.style.setStyle(domElement, "font-size", (element.fontSize()));
    }
    if (element.color()) {
      goog.style.setStyle(domElement, "color", (element.color()));
    }
    if (element.fontFamily()) {
      goog.style.setStyle(domElement, "font-family", (element.fontFamily()));
    }
    if (element.fontStyle()) {
      goog.style.setStyle(domElement, "font-style", (element.fontStyle()));
    }
    if (element.fontVariant()) {
      goog.style.setStyle(domElement, "font-variant", (element.fontVariant()));
    }
    if (element.fontWeight()) {
      goog.style.setStyle(domElement, "font-weight", (element.fontWeight()));
    }
    if (element.letterSpacing()) {
      goog.style.setStyle(domElement, "letter-spacing", (element.letterSpacing()));
    }
    if (element.decoration()) {
      goog.style.setStyle(domElement, "text-decoration", (element.decoration()));
    }
    if (element.opacity()) {
      domElementStyle["filter"] = "alpha(opacity=" + element.opacity() * 100 + ")";
    }
    if (element.lineHeight()) {
      goog.style.setStyle(domElement, "line-height", (element.lineHeight()));
    }
    if (element.textIndent()) {
      goog.style.setStyle(domElement, "text-indent", (element.textIndent()));
    }
    if (element.textOverflow() == "...") {
      goog.style.setStyle(domElement, "text-overflow", "ellipsis");
    }
    if (element.textOverflow() == "") {
      goog.style.setStyle(domElement, "text-overflow", "clip");
    }
    if (element.direction()) {
      goog.style.setStyle(domElement, "direction", (element.direction()));
    }
    if (element.textWrap() == acgraph.vector.Text.TextWrap.BY_LETTER && element.width()) {
      goog.style.setStyle(domElement, "word-break", "break-all");
      goog.style.setStyle(domElement, "white-space", "normal");
    } else {
      goog.style.setStyle(domElement, "word-break", "normal");
      goog.style.setStyle(domElement, "white-space", "nowrap");
    }
    if (element.hAlign()) {
      if (element.rtl) {
        domElement.style["text-align"] = element.hAlign() == acgraph.vector.Text.HAlign.END || element.hAlign() == acgraph.vector.Text.HAlign.LEFT ? acgraph.vector.Text.HAlign.LEFT : element.hAlign() == acgraph.vector.Text.HAlign.START || element.hAlign() == acgraph.vector.Text.HAlign.RIGHT ? acgraph.vector.Text.HAlign.RIGHT : acgraph.vector.Text.HAlign.CENTER;
      } else {
        domElement.style["text-align"] = element.hAlign() == acgraph.vector.Text.HAlign.END || element.hAlign() == acgraph.vector.Text.HAlign.RIGHT ? acgraph.vector.Text.HAlign.RIGHT : element.hAlign() == acgraph.vector.Text.HAlign.START || element.hAlign() == acgraph.vector.Text.HAlign.LEFT ? acgraph.vector.Text.HAlign.LEFT : acgraph.vector.Text.HAlign.CENTER;
      }
    }
    goog.style.setUnselectable(domElement, !element.selectable());
    domElement.innerHTML = element.getSimpleText();
    this.setAttribute_(domElementStyle, "width", (element.width() ? this.toCssSize_((element.width())) : element.getBounds().width).toString());
    this.setAttribute_(domElementStyle, "height", (element.height() ? this.toCssSize_((element.height())) : element.getBounds().height).toString());
  }
};
acgraph.vector.vml.Renderer.prototype.setTextSegmentPosition = function(element) {
  var domElement = element.domElement();
  var path = "m " + this.toSizeCoord_(element.x) + "," + this.toSizeCoord_(element.y) + " l " + (this.toSizeCoord_(element.x) + 1) + "," + this.toSizeCoord_(element.y) + " e";
  domElement.setAttribute("path", path);
};
acgraph.vector.vml.Renderer.prototype.setTextSegmentProperties = function(element) {
  var textEntry = element.parent();
  var textStyle = textEntry.style();
  var segmentStyle = element.getStyle();
  var domElement = element.domElement();
  var style = goog.object.clone(textStyle);
  goog.object.extend(style, segmentStyle);
  var textNode = (this.createTextNode(element.text));
  if (style["fontStyle"]) {
    goog.style.setStyle(textNode, "font-style", style["fontStyle"]);
  }
  if (style["fontVariant"]) {
    goog.style.setStyle(textNode, "font-variant", style["fontVariant"]);
  }
  if (style["fontFamily"]) {
    goog.style.setStyle(textNode, "font-family", style["fontFamily"]);
  }
  if (style["fontSize"]) {
    goog.style.setStyle(textNode, "font-size", style["fontSize"]);
  }
  if (style["fontWeight"]) {
    goog.style.setStyle(textNode, "font-weight", style["fontWeight"]);
  }
  if (style["letterSpacing"]) {
    textNode.style["v-text-spacing"] = style["letterSpacing"];
  }
  if (style["decoration"]) {
    goog.style.setStyle(textNode, "text-decoration", style["decoration"]);
  }
  if (style["hAlign"]) {
    if (textEntry.rtl) {
      textNode.style["v-text-align"] = style["hAlign"] == acgraph.vector.Text.HAlign.END || style["hAlign"] == acgraph.vector.Text.HAlign.LEFT ? acgraph.vector.Text.HAlign.LEFT : style["hAlign"] == acgraph.vector.Text.HAlign.START || style["hAlign"] == acgraph.vector.Text.HAlign.RIGHT ? acgraph.vector.Text.HAlign.RIGHT : acgraph.vector.Text.HAlign.CENTER;
    } else {
      textNode.style["v-text-align"] = style["hAlign"] == acgraph.vector.Text.HAlign.END || style["hAlign"] == acgraph.vector.Text.HAlign.RIGHT ? acgraph.vector.Text.HAlign.RIGHT : style["hAlign"] == acgraph.vector.Text.HAlign.START || style["hAlign"] == acgraph.vector.Text.HAlign.LEFT ? acgraph.vector.Text.HAlign.LEFT : acgraph.vector.Text.HAlign.CENTER;
    }
  }
  if (style["opacity"]) {
    var fill = this.createFillElement();
    this.setAttribute_(fill, "opacity", style["opacity"]);
    goog.dom.appendChild(domElement, fill);
  }
  goog.dom.appendChild(domElement, textNode);
  if (!textEntry.selectable()) {
    this.setAttribute_(domElement, "unselectable", "on");
  } else {
    domElement.removeAttribute("unselectable");
  }
  this.setPositionAndSize_(domElement, 0, 0, 1, 1);
  domElement.setAttribute("filled", "t");
  domElement.setAttribute("fillcolor", style["color"]);
  domElement.setAttribute("stroked", "f");
};
acgraph.vector.vml.Renderer.prototype.textEarsFeint = function(element) {
  var domElement = element.domElement();
  if (acgraph.vector.vml.Renderer.IE8_MODE && element.domElement()) {
    domElement.innerHTML = domElement.innerHTML;
  }
};
acgraph.vector.vml.Renderer.prototype.needsAnotherBehaviourForCalcText = function() {
  return true;
};
acgraph.vector.vml.Renderer.prototype.applyFillAndStroke = function(element) {
  var fill = (element.fill());
  if (fill instanceof acgraph.vector.PatternFill) {
    fill = "black";
  }
  var stroke = (element.stroke());
  var strokeColor;
  if (goog.isString(stroke)) {
    strokeColor = (stroke);
  } else {
    if ("keys" in stroke) {
      strokeColor = stroke["keys"].length != 0 ? stroke["keys"][0]["color"] : "#000";
    } else {
      strokeColor = stroke["color"];
    }
  }
  var isRadialGradient = !goog.isString(fill) && "keys" in fill && "cx" in fill && "cy" in fill;
  var isLinearGradient = !goog.isString(fill) && "keys" in fill && !isRadialGradient;
  var isFill = !isRadialGradient && !isLinearGradient;
  var filled = fill != "none" && fill["color"] != "none";
  var stroked = strokeColor != "none" && stroke["thickness"] != 0;
  var complexFill = isFill && filled && fill["opacity"] != 1;
  var complexStroke = !goog.isString(stroke) && stroked && (stroke["opacity"] != 1 || stroke["lineJoin"] != acgraph.vector.StrokeLineJoin.MITER || stroke["lineCap"] != acgraph.vector.StrokeLineCap.BUTT || stroke["dash"] != "none");
  var requireShapeType = isRadialGradient || isLinearGradient || complexFill || complexStroke;
  var firstKey, lastKey, userSpaceOnUse, angle, keys;
  if (!requireShapeType) {
    this.setAttributes_(element.domElement(), {"type":"", "filled":filled, "fillcolor":fill["color"] || fill, "stroked":stroked, "strokecolor":strokeColor, "strokeweight":stroke["thickness"] ? stroke["thickness"] + "px" : "1px"});
  } else {
    var stage = element.getStage();
    var defs = stage.getDefs();
    var elBounds;
    if (element instanceof acgraph.vector.Path && (element).isEmpty()) {
      elBounds = new acgraph.math.Rect(0, 0, 1, 1);
    } else {
      elBounds = element.getBounds();
    }
    var normalizedFill;
    if (isLinearGradient) {
      userSpaceOnUse = fill["mode"] instanceof acgraph.math.Rect;
      keys = goog.array.slice(fill["keys"], 0);
      if (keys[0]["offset"] != 0) {
        keys.unshift({"offset":0, "color":keys[0]["color"], "opacity":keys[0]["opacity"]});
      }
      lastKey = keys[keys.length - 1];
      if (lastKey["offset"] != 1) {
        keys.push({"offset":1, "color":lastKey["color"], "opacity":lastKey["opacity"]});
      }
      var trueAngle = fill["mode"] ? this.saveGradientAngle(fill["angle"], elBounds) : fill["angle"];
      normalizedFill = defs.getLinearGradient(userSpaceOnUse ? this.userSpaceOnUse_(keys, fill["mode"], trueAngle, elBounds) : keys, fill["opacity"], trueAngle, fill["mode"]);
    } else {
      if (isRadialGradient) {
        var size_x, size_y, cx, cy;
        if (fill["mode"]) {
          var fillBounds = fill["mode"];
          var diameter = Math.min(fillBounds.width, fillBounds.height);
          cx = (fill["cx"] * fillBounds.width - (elBounds.left - fillBounds.left)) / elBounds.width;
          cy = (fill["cy"] * fillBounds.height - (elBounds.top - fillBounds.top)) / elBounds.height;
          var radius = .5;
          size_x = radius * 2 * (diameter / elBounds.width);
          size_y = radius * 2 * (diameter / elBounds.height);
        } else {
          cx = fill["cx"];
          cy = fill["cy"];
          size_x = size_y = 1;
        }
        normalizedFill = defs.getVMLRadialGradient(fill["keys"], cx, cy, size_x, size_y, fill["opacity"], fill["mode"]);
      } else {
        normalizedFill = (fill);
      }
    }
    var shapeType = defs.getShapeType(normalizedFill, stroke);
    var shapeTypeDomElement;
    if (!shapeType.rendered) {
      shapeTypeDomElement = this.createShapeTypeElement();
      this.setIdInternal(shapeTypeDomElement, acgraph.utils.IdGenerator.getInstance().identify(shapeType));
      this.appendChild(defs.domElement(), shapeTypeDomElement);
      shapeType.rendered = true;
      var fillDomElement = null;
      if (isLinearGradient) {
        var lg = (normalizedFill);
        if (lg.rendered) {
          lg = new acgraph.vector.LinearGradient(lg.keys, lg.opacity, lg.angle, lg.mode);
          shapeType.setFill(lg);
        }
        fillDomElement = this.createFillElement();
        keys = lg.keys;
        var colors = [];
        goog.array.forEach(keys, function(key) {
          colors.push(key["offset"] + " " + key["color"]);
        }, this);
        angle = goog.math.standardAngle(lg.angle + 270);
        lastKey = keys[keys.length - 1];
        firstKey = keys[0];
        var opacity = userSpaceOnUse ? lg.opacity : isNaN(firstKey["opacity"]) ? lg.opacity : firstKey["opacity"];
        var opacity2 = userSpaceOnUse ? lg.opacity : isNaN(lastKey["opacity"]) ? lg.opacity : lastKey["opacity"];
        this.setAttributes_(fillDomElement, {"type":"gradient", "method":"none", "colors":colors.join(","), "angle":angle, "color":firstKey["color"], "opacity":opacity2, "color2":lastKey["color"], "o:opacity2":opacity});
        this.appendChild(shapeTypeDomElement, fillDomElement);
        lg.defs = defs;
        lg.rendered = true;
      } else {
        if (isRadialGradient) {
          var rg = (normalizedFill);
          if (rg.rendered) {
            rg = new acgraph.vector.vml.RadialGradient(rg.keys, rg.cx, rg.cy, rg.size_x, rg.size_y, rg.opacity, rg.bounds);
            shapeType.setFill(rg);
          }
          fillDomElement = this.createFillElement();
          keys = rg.keys;
          firstKey = keys[keys.length - 1];
          lastKey = keys[0];
          this.setAttributes_(fillDomElement, {"src":stage["pathToRadialGradientImage"], "size":rg.size_x + "," + rg.size_y, "origin":".5, .5", "position":rg.cx + "," + rg.cy, "type":"pattern", "method":"linear sigma", "colors":"0 " + firstKey["color"] + ";1 " + lastKey["color"], "color":firstKey["color"], "opacity":isNaN(firstKey["opacity"]) ? rg.opacity : firstKey["opacity"], "color2":lastKey["color"], "o:opacity2":isNaN(lastKey["opacity"]) ? rg.opacity : lastKey["opacity"]});
          this.appendChild(shapeTypeDomElement, fillDomElement);
          rg.defs = defs;
          rg.rendered = true;
        } else {
          if (isFill) {
            fillDomElement = shapeType.fillDomElement ? shapeType.fillDomElement : shapeType.fillDomElement = this.createFillElement();
            if (goog.isString(fill)) {
              this.setAttributes_(element.domElement(), {"fillcolor":fill, "filled":fill != "none"});
              this.setAttributes_(fillDomElement, {"type":"solid", "on":fill != "none", "color":fill, "opacity":1});
            } else {
              this.setAttributes_(element.domElement(), {"fillcolor":fill["color"], "filled":fill["color"] != "none"});
              this.setAttributes_(fillDomElement, {"type":"solid", "on":fill["color"] != "none", "color":fill["color"], "opacity":isNaN(fill["opacity"]) ? 1 : fill["opacity"]});
            }
          }
        }
      }
      this.appendChild(shapeTypeDomElement, fillDomElement);
      var strokeDomElement = shapeType.strokeDomElement ? shapeType.strokeDomElement : shapeType.strokeDomElement = this.createStrokeElement();
      var thickness = stroke["thickness"] ? stroke["thickness"] : 1;
      var dash = this.vmlizeDash(stroke["dash"], thickness);
      var cap = dash ? "flat" : stroke["lineCap"];
      this.setAttributes_(strokeDomElement, {"joinstyle":stroke["lineJoin"] || acgraph.vector.StrokeLineJoin.MITER, "endcap":cap == acgraph.vector.StrokeLineCap.BUTT ? "flat" : cap, "dashstyle":dash, "on":stroked, "color":strokeColor, "opacity":goog.isObject(stroke) && "opacity" in stroke ? stroke["opacity"] : 1, "weight":thickness + "px"});
      this.appendChild(shapeTypeDomElement, strokeDomElement);
    }
    if (isRadialGradient || isLinearGradient) {
      firstKey = normalizedFill.keys[normalizedFill.keys.length - 1];
      this.setAttributes_(element.domElement(), {"fillcolor":firstKey["color"], "filled":firstKey["color"] != "none"});
    }
    this.setAttributes_(element.domElement(), {"filled":filled, "fillcolor":fill["color"] || fill, "stroked":stroked, "strokecolor":strokeColor, "strokeweight":stroke["thickness"] ? stroke["thickness"] + "px" : "1px"});
    this.setAttributes_(element.domElement(), {"type":"#" + acgraph.utils.IdGenerator.getInstance().identify(shapeType)});
  }
};
acgraph.vector.vml.Renderer.prototype.vmlizeDash = function(dash, lineThickness) {
  dash = String(dash);
  if (!dash) {
    return "none";
  }
  var lengths = dash.split(" ");
  if (lengths.length % 2 != 0) {
    lengths.push.apply(lengths, lengths);
  }
  var result = [];
  for (var i = 0;i < lengths.length;i++) {
    result.push(Math.ceil(parseFloat(lengths[i]) / lineThickness));
  }
  return result.join(" ");
};
acgraph.vector.vml.Renderer.prototype.setVisible = function(element) {
  var style = element.domElement()["style"];
  this.setAttribute_(style, "visibility", element.visible() ? "" : "hidden");
};
acgraph.vector.vml.Renderer.prototype.setTransformation = function(element) {
  this.setTransform_(element, element.getBoundsWithoutTransform());
};
acgraph.vector.vml.Renderer.prototype.setRectTransformation = function(element) {
  var bounds = element.getBoundsWithoutTransform();
  var domElement = element.domElement();
  var left = bounds.left;
  var top = bounds.top;
  var right = left + bounds.width;
  var bottom = top + bounds.height;
  var points = [right, top, right, bottom, left, bottom, left, top];
  var transform = element.getFullTransformation();
  if (transform && !transform.isIdentity()) {
    transform.transform(points, 0, points, 0, points.length / 2);
  }
  points = goog.array.map(points, this.toSizeCoord_);
  var pathData = ["m", points[6], points[7], "l"];
  acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, points, pathData);
  pathData.push("x");
  this.setAttribute_(domElement, "path", pathData.join(" "));
};
acgraph.vector.vml.Renderer.prototype.setEllipseTransformation = function(element) {
  var domElement = element.domElement();
  var cx = (element.centerX());
  var cy = (element.centerY());
  var rx = (element.radiusX());
  var ry = (element.radiusY());
  var transform = element.getFullTransformation();
  var list;
  if (transform && !transform.isIdentity()) {
    var curves = acgraph.math.arcToBezier(cx, cy, rx, ry, 0, 360, false);
    var len = curves.length;
    transform.transform(curves, 0, curves, 0, len / 2);
    list = ["m", this.toSizeCoord_(curves[len - 2]), this.toSizeCoord_(curves[len - 1]), "c"];
    acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(curves, this.toSizeCoord_), list);
  } else {
    list = ["ae", this.toSizeCoord_(cx), this.toSizeCoord_(cy), this.toSizeCoord_(rx), this.toSizeCoord_(ry), 0, Math.round(360 * -65536)];
  }
  list.push("x");
  this.setAttribute_(domElement, "path", list.join(" "));
};
acgraph.vector.vml.Renderer.prototype.setImageTransformation = function(element) {
  var style = element.domElement()["style"];
  var bounds = element.getBoundsWithoutTransform();
  var tx = element.getFullTransformation();
  if (!tx) {
    return;
  }
  var angle = acgraph.math.getRotationAngle(tx);
  this.setAttribute_(style, "rotation", angle.toString());
};
acgraph.vector.vml.Renderer.prototype.setPathTransformation = function(path) {
  var element = path.domElement();
  var pathData = this.getVmlPath_(path, true);
  if (pathData) {
    this.setAttribute_(element, "path", pathData);
  } else {
    this.removeAttribute_(element, "path");
  }
};
acgraph.vector.vml.Renderer.prototype.setLayerTransformation = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.setTextTransformation = function(element) {
  var tx = element.getFullTransformation();
  if (!tx) {
    return;
  }
  var segments = element.getSegments();
  var domElement = element.domElement();
  var domElementStyle = domElement["style"];
  var i, len;
  var x, y;
  if (element.isComplex()) {
    y = element.calcY;
    if (element.getSegments().length) {
      y -= element.getSegments()[0].baseLine;
    }
    x = element.calcX;
    this.setAttributes_(domElementStyle, {"position":"absolute", "overflow":"visible", "left":this.toCssSize_(x + tx.getTranslateX()), "top":this.toCssSize_(y + tx.getTranslateY())});
    var changed = element.isScaleOrShearChanged();
    if (changed) {
      for (i = 0, len = segments.length;i < len;i++) {
        var segment = (segments[i]);
        var skew;
        if (segment.skew) {
          skew = segment.skew;
          this.setAttributes_(skew, {"origin":[-.5 - x, -.5 - y].join(","), "matrix":[acgraph.math.round(tx.getScaleX(), 6), acgraph.math.round(tx.getShearX(), 6), acgraph.math.round(tx.getShearY(), 6), acgraph.math.round(tx.getScaleY(), 6), 0, 0].join(",")});
        } else {
          skew = segment.skew = this.createVMLElement_("skew");
        }
        if (!segment.skewAttached && segment.domElement()) {
          this.appendChild(segment.domElement(), skew);
          segment.skewAttached = true;
        }
        var origin = [-.5 - x, -.5 - y].join(",");
        if (segment.domElement()) {
          segment.domElement()["rotation"] = 0;
        }
        this.setAttributes_(skew, {"on":"true", "origin":origin, "matrix":[acgraph.math.round(tx.getScaleX(), 6), acgraph.math.round(tx.getShearX(), 6), acgraph.math.round(tx.getShearY(), 6), acgraph.math.round(tx.getScaleY(), 6), 0, 0].join(",")});
      }
    }
  } else {
    x = element.x();
    y = element.y();
    if (element.vAlign() && element.height() && element.height() > element.realHeigth) {
      if (element.vAlign() == "middle") {
        y += element.height() / 2 - element.realHeigth / 2;
      }
      if (element.vAlign() == "bottom") {
        y += element.height() - element.realHeigth;
      }
    }
    this.setAttributes_(domElementStyle, {"position":"absolute", "overflow":"hidden", "left":this.toCssSize_(x + tx.getTranslateX()), "top":this.toCssSize_(y + tx.getTranslateY())});
  }
};
acgraph.vector.vml.Renderer.prototype.needsReRenderOnParentTransformationChange = function() {
  return true;
};
acgraph.vector.vml.Renderer.prototype.setTransform_ = function(element, bounds) {
  var tx = element.getFullTransformation();
  if (!tx) {
    if (element.skewAttached) {
      this.removeNode(element.skew);
      element.skewAttached = false;
    }
    return;
  }
  var skew;
  if (element.skew) {
    skew = element.skew;
  } else {
    skew = element.skew = this.createVMLElement_("skew");
  }
  if (!element.skewAttached) {
    this.appendChild(element.domElement(), skew);
    element.skewAttached = true;
  }
  var origin = [-.5 - bounds.left / bounds.width, -.5 - bounds.top / bounds.height].join(",");
  this.setAttributes_(skew, {"on":"true", "origin":origin, "matrix":[acgraph.math.round(tx.getScaleX(), 6), acgraph.math.round(tx.getShearX(), 6), acgraph.math.round(tx.getShearY(), 6), acgraph.math.round(tx.getScaleY(), 6), 0, 0].join(",")});
  this.setAttributes_(element.domElement()["style"], {"left":this.toCssSize_(bounds.left + tx.getTranslateX()), "top":this.toCssSize_(bounds.top + tx.getTranslateY())});
};
acgraph.vector.vml.Renderer.prototype.setPointerEvents = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.disposeClip = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.setDisableStrokeScaling = goog.nullFunction;
acgraph.vector.vml.Renderer.prototype.addClip_ = function(element, clipRect, isLayer) {
  clipRect = clipRect.clone();
  var style = element.domElement()["style"];
  if (goog.isDef(isLayer) && isLayer) {
    var tx = element.getFullTransformation();
    clipRect = acgraph.math.getBoundsOfRectWithTransform(clipRect, tx);
  } else {
    clipRect.left -= element.getX();
    clipRect.top -= element.getY();
  }
  var left = clipRect.left;
  var top = clipRect.top;
  var right = left + clipRect.width;
  var bottom = top + clipRect.height;
  var clipVal = ["rect(", top + "px", right + "px", bottom + "px", left + "px", ")"].join(" ");
  this.setAttribute_(style, "clip", clipVal);
};
acgraph.vector.vml.Renderer.prototype.removeClip_ = function(element) {
  var style = element.domElement()["style"];
  this.removeStyle_(style, "clip");
};
acgraph.vector.vml.Renderer.prototype.setClip = function(element) {
  var isLayer = element instanceof acgraph.vector.Layer;
  var clipElement = (element.clip());
  if (clipElement) {
    var shape = (clipElement.shape());
    var clipShape = shape.getBoundsWithTransform(shape.getSelfTransformation());
    this.addClip_(element, (clipShape), isLayer);
  } else {
    this.removeClip_(element);
  }
};
acgraph.vector.vml.Renderer.prototype.needsReClipOnBoundsChange = function() {
  return true;
};
goog.provide("acgraph.compatibility");
acgraph.compatibility.USE_ABSOLUTE_REFERENCES = null;
goog.provide("acgraph.vector.vml.Clip");
goog.require("acgraph.vector.Clip");
acgraph.vector.vml.Clip = function(stage, opt_leftOrRect, opt_top, opt_width, opt_height) {
  goog.base(this, stage, opt_leftOrRect, opt_top, opt_width, opt_height);
};
goog.inherits(acgraph.vector.vml.Clip, acgraph.vector.Clip);
acgraph.vector.vml.Clip.prototype.render = function() {
  var stage = this.stage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) {
    stage.suspend();
  }
  goog.array.forEach(this.elements, function(element) {
    element.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
  }, this);
  if (manualSuspend) {
    stage.resume();
  }
};
goog.provide("goog.math.Line");
goog.require("goog.math");
goog.require("goog.math.Coordinate");
goog.math.Line = function(x0, y0, x1, y1) {
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
};
goog.math.Line.prototype.clone = function() {
  return new goog.math.Line(this.x0, this.y0, this.x1, this.y1);
};
goog.math.Line.prototype.equals = function(other) {
  return this.x0 == other.x0 && this.y0 == other.y0 && this.x1 == other.x1 && this.y1 == other.y1;
};
goog.math.Line.prototype.getSegmentLengthSquared = function() {
  var xdist = this.x1 - this.x0;
  var ydist = this.y1 - this.y0;
  return xdist * xdist + ydist * ydist;
};
goog.math.Line.prototype.getSegmentLength = function() {
  return Math.sqrt(this.getSegmentLengthSquared());
};
goog.math.Line.prototype.getClosestLinearInterpolation_ = function(x, opt_y) {
  var y;
  if (x instanceof goog.math.Coordinate) {
    y = x.y;
    x = x.x;
  } else {
    y = opt_y;
  }
  var x0 = this.x0;
  var y0 = this.y0;
  var xChange = this.x1 - x0;
  var yChange = this.y1 - y0;
  return ((Number(x) - x0) * xChange + (Number(y) - y0) * yChange) / this.getSegmentLengthSquared();
};
goog.math.Line.prototype.getInterpolatedPoint = function(t) {
  return new goog.math.Coordinate(goog.math.lerp(this.x0, this.x1, t), goog.math.lerp(this.y0, this.y1, t));
};
goog.math.Line.prototype.getClosestPoint = function(x, opt_y) {
  return this.getInterpolatedPoint(this.getClosestLinearInterpolation_(x, opt_y));
};
goog.math.Line.prototype.getClosestSegmentPoint = function(x, opt_y) {
  return this.getInterpolatedPoint(goog.math.clamp(this.getClosestLinearInterpolation_(x, opt_y), 0, 1));
};
goog.provide("acgraph.vector.svg.Renderer");
goog.require("acgraph.math.Rect");
goog.require("acgraph.utils.IdGenerator");
goog.require("acgraph.vector.Renderer");
goog.require("goog.dom");
goog.require("goog.math.Line");
goog.require("goog.object");
goog.require("goog.userAgent");
acgraph.vector.svg.Renderer = function() {
  goog.base(this);
};
goog.inherits(acgraph.vector.svg.Renderer, acgraph.vector.Renderer);
goog.addSingletonGetter(acgraph.vector.svg.Renderer);
acgraph.vector.svg.Renderer.SVG_NS_ = "http://www.w3.org/2000/svg";
acgraph.vector.svg.Renderer.XLINK_NS_ = "http://www.w3.org/1999/xlink";
acgraph.vector.svg.Renderer.prototype.measurement_ = null;
acgraph.vector.svg.Renderer.prototype.measurementText_ = null;
acgraph.vector.svg.Renderer.prototype.measurementTextNode_ = null;
acgraph.vector.svg.Renderer.prototype.measurementGroupNode_ = null;
acgraph.vector.svg.Renderer.prototype.imageLoader_ = null;
acgraph.vector.svg.Renderer.prototype.createSVGElement_ = function(tag) {
  return goog.dom.getDocument().createElementNS(acgraph.vector.svg.Renderer.SVG_NS_, tag);
};
acgraph.vector.svg.Renderer.prototype.setAttribute_ = function(el, key, value) {
  el.setAttribute(key, value);
};
acgraph.vector.svg.Renderer.prototype.removeAttribute_ = function(el, key) {
  el.removeAttribute(key);
};
acgraph.vector.svg.Renderer.prototype.setAttributes_ = function(el, attrs) {
  goog.object.forEach(attrs, function(val, key) {
    this.setAttribute_(el, key, val);
  }, this);
};
acgraph.vector.svg.Renderer.prototype.getAttribute_ = function(el, key) {
  return el.getAttribute(key);
};
acgraph.vector.svg.Renderer.prototype.createMeasurement_ = function() {
  this.measurement_ = this.createSVGElement_("svg");
  this.measurementText_ = this.createTextElement();
  this.measurementTextNode_ = this.createTextNode("");
  goog.dom.appendChild(this.measurementText_, this.measurementTextNode_);
  goog.dom.appendChild(this.measurement_, this.measurementText_);
  goog.dom.appendChild(goog.dom.getDocument().body, this.measurement_);
  this.setAttributes_(this.measurement_, {"display":"block", "width":0, "height":0});
  this.measurementGroupNode_ = this.createLayerElement();
  goog.dom.appendChild(this.measurement_, this.measurementGroupNode_);
};
acgraph.vector.svg.Renderer.prototype.measure = function(text, style) {
  if (!this.measurement_) {
    this.createMeasurement_();
  }
  var spaceWidth = null;
  var additionWidth = 0;
  if (text.length == 0) {
    return this.getEmptyStringBounds(style);
  }
  if (goog.string.isSpace(text)) {
    return this.getSpaceBounds(style);
  } else {
    if (goog.string.startsWith(text, " ")) {
      additionWidth += spaceWidth = this.getSpaceBounds(style).width;
    }
    if (goog.string.endsWith(text, " ")) {
      additionWidth += spaceWidth || this.getSpaceBounds(style).width;
    }
  }
  style["fontStyle"] ? this.setAttribute_(this.measurementText_, "font-style", style["fontStyle"]) : this.removeAttribute_(this.measurementText_, "font-style");
  style["fontVariant"] ? this.setAttribute_(this.measurementText_, "font-variant", style["fontVariant"]) : this.removeAttribute_(this.measurementText_, "font-variant");
  style["fontFamily"] ? this.setAttribute_(this.measurementText_, "font-family", style["fontFamily"]) : this.removeAttribute_(this.measurementText_, "font-family");
  style["fontSize"] ? this.setAttribute_(this.measurementText_, "font-size", style["fontSize"]) : this.removeAttribute_(this.measurementText_, "font-size");
  style["fontWeight"] ? this.setAttribute_(this.measurementText_, "font-weight", style["fontWeight"]) : this.removeAttribute_(this.measurementText_, "font-weight");
  style["letterSpacing"] ? this.setAttribute_(this.measurementText_, "letter-spacing", style["letterSpacing"]) : this.removeAttribute_(this.measurementText_, "letter-spacing");
  style["decoration"] ? this.setAttribute_(this.measurementText_, "text-decoration", style["decoration"]) : this.removeAttribute_(this.measurementText_, "text-decoration");
  this.measurementTextNode_.nodeValue = text;
  var bbox = this.measurementText_["getBBox"]();
  this.measurementTextNode_.nodeValue = "";
  if (style["fontVariant"] && goog.userAgent.OPERA) {
    this.measurementTextNode_.nodeValue = text.charAt(0).toUpperCase();
    bbox.height = this.measurementText_["getBBox"]().height;
  }
  return new acgraph.math.Rect(bbox.x, bbox.y, bbox.width + additionWidth, bbox.height);
};
acgraph.vector.svg.Renderer.prototype.measureElement = function(element) {
  if (!this.measurement_) {
    this.createMeasurement_();
  }
  if (goog.isString(element)) {
    this.measurementGroupNode_.innerHTML = element;
  } else {
    goog.dom.appendChild(this.measurementGroupNode_, element.cloneNode(true));
  }
  var bbox = this.measurementGroupNode_["getBBox"]();
  goog.dom.removeChildren(this.measurementGroupNode_);
  return new acgraph.math.Rect(bbox.x, bbox.y, bbox.width, bbox.height);
};
acgraph.vector.svg.Renderer.prototype.measuringImage = function(src, callback) {
  if (!this.imageMap_) {
    this.getImageLoader();
    this.imageMap_ = {};
    goog.events.listen(this.imageLoader_, goog.net.EventType.COMPLETE, function(e) {
      this.starLoadImage_ = false;
    }, false, this);
    goog.events.listen(this.imageLoader_, goog.events.EventType.LOAD, this.onImageLoadHandler_, false, this);
  }
  this.imageMap_[goog.getUid(callback)] = [src, callback];
  this.starLoadImage_ = true;
  this.imageLoader_.addImage(src, src);
  this.imageLoader_.start();
};
acgraph.vector.svg.Renderer.prototype.onImageLoadHandler_ = function(e) {
  var target = e.target;
  goog.object.forEach(this.imageMap_, function(value, key) {
    if (value[0] == target.id) {
      var callback = value[1];
      callback.call(this, target.naturalWidth, target.naturalHeight);
      delete this.imageMap_[key];
    }
  }, this);
};
acgraph.vector.svg.Renderer.prototype.isImageLoading = function() {
  return this.starLoadImage_;
};
acgraph.vector.svg.Renderer.prototype.getSvgPath_ = function(path) {
  if (path.isEmpty()) {
    return null;
  }
  var list = [];
  path.forEachSegment(function(segment, args) {
    switch(segment) {
      case acgraph.vector.PathBase.Segment.MOVETO:
        list.push("M");
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, args, list);
        break;
      case acgraph.vector.PathBase.Segment.LINETO:
        list.push("L");
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, args, list);
        break;
      case acgraph.vector.PathBase.Segment.CURVETO:
        list.push("C");
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, args, list);
        break;
      case acgraph.vector.PathBase.Segment.ARCTO:
        var extent = args[3];
        list.push("A", args[0], args[1], 0, Math.abs(extent) > 180 ? 1 : 0, extent > 0 ? 1 : 0, args[4], args[5]);
        break;
      case acgraph.vector.PathBase.Segment.CLOSE:
        list.push("Z");
        break;
    }
  });
  return list.join(" ");
};
acgraph.vector.svg.Renderer.prototype.getObjectBoundingBoxGradientVector_ = function(angle) {
  var radAngle = goog.math.toRadians(angle);
  var tanAngle = Math.tan(radAngle);
  var dx = 1 / (tanAngle * 2);
  var dy = tanAngle / 2;
  var swap = false;
  if (Math.abs(dy) <= .5) {
    dx = -.5;
    swap = Math.cos(radAngle) < 0;
  } else {
    dy = -.5;
    swap = Math.sin(radAngle) > 0;
  }
  if (swap) {
    dx = -dx;
    dy = -dy;
  }
  return new goog.math.Line(.5 + dx, .5 + dy, .5 - dx, .5 - dy);
};
acgraph.vector.svg.Renderer.prototype.getUserSpaceOnUseGradientVector_ = function(angle, bounds) {
  var angleTransform = angle % 90;
  var radAngle = goog.math.toRadians(angle);
  var dx = 1;
  var dy = 1;
  var centerX = bounds.left + bounds.width / 2;
  var centerY = bounds.top + bounds.height / 2;
  var swap = Math.sin(radAngle) < 0 || angle == 180 || angle == 360;
  if (angle == 90 || angle == 270) {
    angleTransform += 1E-6;
  }
  if (angle != 180 && (Math.tan(radAngle) < 0 || angle == 90 || angle == 270)) {
    dx = -1;
    angleTransform = 90 - angleTransform;
  }
  var radAngleTransform = goog.math.toRadians(angleTransform);
  var halfLengthVector = Math.sin(radAngleTransform) * (bounds.height / 2 - Math.tan(radAngleTransform) * bounds.width / 2) + bounds.width / 2 / Math.cos(radAngleTransform);
  dx *= Math.cos(radAngleTransform) * halfLengthVector;
  dy *= Math.sin(radAngleTransform) * halfLengthVector;
  if (swap) {
    dx = -dx;
    dy = -dy;
  }
  return new goog.math.Line(Math.round(centerX - dx), Math.round(centerY + dy), Math.round(centerX + dx), Math.round(centerY - dy));
};
acgraph.vector.svg.Renderer.prototype.createStageElement = function() {
  var element = this.createSVGElement_("svg");
  if (!goog.userAgent.IE) {
    this.setAttribute_(element, "xmlns", acgraph.vector.svg.Renderer.SVG_NS_);
  }
  this.setAttribute_(element, "border", "0");
  return element;
};
acgraph.vector.svg.Renderer.prototype.createLinearGradientElement = function() {
  return this.createSVGElement_("linearGradient");
};
acgraph.vector.svg.Renderer.prototype.createRadialGradientElement = function() {
  return this.createSVGElement_("radialGradient");
};
acgraph.vector.svg.Renderer.prototype.createFillPatternElement = function() {
  return this.createSVGElement_("pattern");
};
acgraph.vector.svg.Renderer.prototype.createImageElement = function() {
  return this.createSVGElement_("image");
};
acgraph.vector.svg.Renderer.prototype.createGradientKey = function() {
  return this.createSVGElement_("stop");
};
acgraph.vector.svg.Renderer.prototype.createLayerElement = function() {
  return this.createSVGElement_("g");
};
acgraph.vector.svg.Renderer.prototype.createRectElement = function() {
  return this.createSVGElement_("rect");
};
acgraph.vector.svg.Renderer.prototype.createCircleElement = function() {
  return this.createSVGElement_("circle");
};
acgraph.vector.svg.Renderer.prototype.createPathElement = function() {
  return this.createSVGElement_("path");
};
acgraph.vector.svg.Renderer.prototype.createEllipseElement = function() {
  return this.createSVGElement_("ellipse");
};
acgraph.vector.svg.Renderer.prototype.createDefsElement = function() {
  return this.createSVGElement_("defs");
};
acgraph.vector.svg.Renderer.prototype.createTextElement = function() {
  return this.createSVGElement_("text");
};
acgraph.vector.svg.Renderer.prototype.createTextSegmentElement = function() {
  return this.createSVGElement_("tspan");
};
acgraph.vector.svg.Renderer.prototype.createTextNode = function(text) {
  return goog.dom.createTextNode(text);
};
acgraph.vector.svg.Renderer.prototype.setFillPatternProperties = function(element) {
  var bounds = element.getBoundsWithoutTransform();
  this.setAttributes_(element.domElement(), {"x":bounds.left, "y":bounds.top, "width":bounds.width, "height":bounds.height, "patternUnits":"userSpaceOnUse"});
};
acgraph.vector.svg.Renderer.prototype.setImageProperties = function(element) {
  var bounds = element.getBoundsWithoutTransform();
  this.measuringImage((element.src()), goog.nullFunction);
  var src = (element.src() || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
  var domElement = element.domElement();
  this.setAttributes_(domElement, {"x":bounds.left, "y":bounds.top, "width":bounds.width, "height":bounds.height, "image-rendering":"optimizeQuality", "preserveAspectRatio":element.align() + " " + element.fittingMode(), "opacity":element.opacity()});
  domElement.setAttributeNS(acgraph.vector.svg.Renderer.XLINK_NS_, "href", src);
};
acgraph.vector.svg.Renderer.prototype.setCursorProperties = function(element, cursor) {
  var domElement = element.domElement();
  if (domElement) {
    domElement.style["cursor"] = cursor || "";
  }
};
acgraph.vector.svg.Renderer.prototype.setTextPosition = function(element) {
  var domElement = element.domElement();
  this.setAttribute_(domElement, "x", element.calcX);
  this.setAttribute_(domElement, "y", element.calcY);
};
acgraph.vector.svg.Renderer.prototype.setTextProperties = function(element) {
  var style = element.style();
  var domElement = element.domElement();
  if (!element.selectable()) {
    domElement.style["-webkit-touch-callout"] = "none";
    domElement.style["-webkit-user-select"] = "none";
    domElement.style["-khtml-user-select"] = "none";
    domElement.style["-moz-user-select"] = "moz-none";
    domElement.style["-ms-user-select"] = "none";
    domElement.style["-o-user-select"] = "none";
    domElement.style["user-select"] = "none";
    if (goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 9 || goog.userAgent.OPERA) {
      this.setAttribute_(domElement, "unselectable", "on");
      this.setAttribute_(domElement, "onselectstart", "return false;");
    }
  } else {
    domElement.style["-webkit-touch-callout"] = "";
    domElement.style["-webkit-user-select"] = "";
    domElement.style["-khtml-user-select"] = "";
    domElement.style["-moz-user-select"] = "";
    domElement.style["-ms-user-select"] = "";
    domElement.style["-o-user-select"] = "";
    domElement.style["user-select"] = "";
    if (goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 9 || goog.userAgent.OPERA) {
      this.removeAttribute_(domElement, "unselectable");
      this.removeAttribute_(domElement, "onselectstart");
    }
  }
  if (style["fontStyle"]) {
    this.setAttribute_(domElement, "font-style", style["fontStyle"]);
  } else {
    this.removeAttribute_(domElement, "font-style");
  }
  if (style.fontVariant) {
    if (goog.userAgent.GECKO) {
      domElement.style["font-variant"] = style["fontVariant"];
    } else {
      this.setAttribute_(domElement, "font-variant", style["fontVariant"]);
    }
  } else {
    if (goog.userAgent.GECKO) {
      domElement.style["font-variant"] = "";
    } else {
      this.removeAttribute_(domElement, "font-variant");
    }
  }
  if (style["fontFamily"]) {
    this.setAttribute_(domElement, "font-family", style["fontFamily"]);
  } else {
    this.removeAttribute_(domElement, "font-family");
  }
  if (style["fontSize"]) {
    this.setAttribute_(domElement, "font-size", style["fontSize"]);
  } else {
    this.removeAttribute_(domElement, "font-size");
  }
  if (style["fontWeight"]) {
    this.setAttribute_(domElement, "font-weight", style["fontWeight"]);
  } else {
    this.removeAttribute_(domElement, "font-weight");
  }
  if (style["color"]) {
    this.setAttribute_(domElement, "fill", style["color"]);
  } else {
    this.removeAttribute_(domElement, "fill");
  }
  if (style["letterSpacing"]) {
    this.setAttribute_(domElement, "letter-spacing", style["letterSpacing"]);
  } else {
    this.removeAttribute_(domElement, "letter-spacing");
  }
  if (style["decoration"]) {
    if (goog.userAgent.GECKO) {
      this.setAttribute_(domElement, "text-decoration", style["decoration"]);
    } else {
      this.setAttribute_(domElement, "text-decoration", style["decoration"]);
    }
  } else {
    this.removeAttribute_(domElement, "text-decoration");
  }
  if (style["direction"]) {
    this.setAttribute_(domElement, "direction", style["direction"]);
  } else {
    this.removeAttribute_(domElement, "direction");
  }
  if (style["hAlign"]) {
    var align;
    if (style["direction"] == "rtl") {
      if (goog.userAgent.GECKO || goog.userAgent.IE) {
        align = style["hAlign"] == acgraph.vector.Text.HAlign.END || style["hAlign"] == acgraph.vector.Text.HAlign.LEFT ? acgraph.vector.Text.HAlign.START : style["hAlign"] == acgraph.vector.Text.HAlign.START || style["hAlign"] == acgraph.vector.Text.HAlign.RIGHT ? acgraph.vector.Text.HAlign.END : "middle";
      } else {
        align = style["hAlign"] == acgraph.vector.Text.HAlign.END || style["hAlign"] == acgraph.vector.Text.HAlign.LEFT ? acgraph.vector.Text.HAlign.END : style["hAlign"] == acgraph.vector.Text.HAlign.START || style["hAlign"] == acgraph.vector.Text.HAlign.RIGHT ? acgraph.vector.Text.HAlign.START : "middle";
      }
    } else {
      align = style["hAlign"] == acgraph.vector.Text.HAlign.END || style["hAlign"] == acgraph.vector.Text.HAlign.RIGHT ? acgraph.vector.Text.HAlign.END : style["hAlign"] == acgraph.vector.Text.HAlign.START || style["hAlign"] == acgraph.vector.Text.HAlign.LEFT ? acgraph.vector.Text.HAlign.START : "middle";
    }
    this.setAttribute_(domElement, "text-anchor", (align));
  } else {
    this.removeAttribute_(domElement, "text-anchor");
  }
  if (style["opacity"]) {
    domElement.style["opacity"] = style["opacity"];
  } else {
    domElement.style["opacity"] = "1";
  }
};
acgraph.vector.svg.Renderer.prototype.setTextSegmentPosition = function(element) {
  var domElement = element.domElement();
  var text = element.parent();
  if (element.firstInLine || element.dx) {
    this.setAttribute_(domElement, "x", text.calcX + element.dx);
  }
  this.setAttribute_(domElement, "dy", element.dy);
};
acgraph.vector.svg.Renderer.prototype.setTextSegmentProperties = function(element) {
  var style = element.getStyle();
  var domElement = element.domElement();
  var text = element.parent();
  var textNode = this.createTextNode(element.text);
  goog.dom.appendChild(domElement, textNode);
  if (goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 9 || goog.userAgent.OPERA) {
    if (!text.selectable()) {
      this.setAttribute_(domElement, "onselectstart", "return false;");
      this.setAttribute_(domElement, "unselectable", "on");
    } else {
      this.removeAttribute_(domElement, "onselectstart");
      this.removeAttribute_(domElement, "unselectable");
    }
  }
  if (style.fontStyle) {
    this.setAttribute_(domElement, "font-style", style.fontStyle);
  }
  if (style.fontVariant) {
    this.setAttribute_(domElement, "font-variant", style.fontVariant);
  }
  if (style.fontFamily) {
    this.setAttribute_(domElement, "font-family", style.fontFamily);
  }
  if (style.fontSize) {
    this.setAttribute_(domElement, "font-size", style.fontSize);
  }
  if (style.fontWeight) {
    this.setAttribute_(domElement, "font-weight", style.fontWeight);
  }
  if (style.color) {
    this.setAttribute_(domElement, "fill", style.color);
  }
  if (style.letterSpacing) {
    this.setAttribute_(domElement, "letter-spacing", style.letterSpacing);
  }
  if (style.decoration) {
    this.setAttribute_(domElement, "text-decoration", style.decoration);
  }
};
acgraph.vector.svg.Renderer.prototype.createClipElement = function() {
  return this.createSVGElement_("clipPath");
};
acgraph.vector.svg.Renderer.prototype.renderRadialGradient = function(fill, defs) {
  var gradient = defs.getRadialGradient(fill["keys"], fill["cx"], fill["cy"], fill["fx"], fill["fy"], fill["opacity"], fill["mode"], fill["transform"]);
  if (!gradient.rendered) {
    var fillDomElement = this.createRadialGradientElement();
    this.setIdInternal(fillDomElement, gradient.id());
    this.appendChild(defs.domElement(), fillDomElement);
    gradient.defs = defs;
    gradient.rendered = true;
    goog.array.forEach(gradient.keys, function(key) {
      var keyDomElement = this.createGradientKey();
      this.setAttributes_(keyDomElement, {"offset":key["offset"], "style":"stop-color:" + key["color"] + ";stop-opacity:" + (isNaN(key["opacity"]) ? gradient.opacity : key["opacity"])});
      this.appendChild(fillDomElement, keyDomElement);
    }, this);
    if (gradient.bounds) {
      this.setAttributes_(fillDomElement, {"cx":gradient.cx * gradient.bounds.width + gradient.bounds.left, "cy":gradient.cy * gradient.bounds.height + gradient.bounds.top, "fx":gradient.fx * gradient.bounds.width + gradient.bounds.left, "fy":gradient.fy * gradient.bounds.height + gradient.bounds.top, "r":Math.min(gradient.bounds.width, gradient.bounds.height) / 2, "spreadMethod":"pad", "gradientUnits":"userSpaceOnUse"});
    } else {
      this.setAttributes_(fillDomElement, {"cx":gradient.cx, "cy":gradient.cy, "fx":gradient.fx, "fy":gradient.fy, "gradientUnits":"objectBoundingBox"});
    }
    if (gradient.transform) {
      this.setAttribute_(fillDomElement, "gradientTransform", gradient.transform.toString());
    }
  }
  return gradient.id();
};
acgraph.vector.svg.Renderer.prototype.renderLinearGradient = function(fill, defs, elementBounds) {
  var angle = fill["mode"] === true ? this.saveGradientAngle(fill["angle"], elementBounds) : fill["angle"];
  var gradient = defs.getLinearGradient(fill["keys"], fill["opacity"], angle, fill["mode"], fill["transform"]);
  if (!gradient.rendered) {
    var fillDomElement = this.createLinearGradientElement();
    this.setIdInternal(fillDomElement, gradient.id());
    this.appendChild(defs.domElement(), fillDomElement);
    gradient.defs = defs;
    gradient.rendered = true;
    goog.array.forEach(gradient.keys, function(key) {
      var keyDomElement = this.createGradientKey();
      this.setAttributes_(keyDomElement, {"offset":key["offset"], "style":"stop-color:" + key["color"] + ";stop-opacity:" + (isNaN(key["opacity"]) ? gradient.opacity : key["opacity"])});
      this.appendChild(fillDomElement, keyDomElement);
    }, this);
    var vector;
    if (gradient.bounds) {
      vector = this.getUserSpaceOnUseGradientVector_(gradient.angle, gradient.bounds);
      this.setAttributes_(fillDomElement, {"x1":vector.x0, "y1":vector.y0, "x2":vector.x1, "y2":vector.y1, "spreadMethod":"pad", "gradientUnits":"userSpaceOnUse"});
    } else {
      vector = this.getObjectBoundingBoxGradientVector_(gradient.angle);
      this.setAttributes_(fillDomElement, {"x1":vector.x0, "y1":vector.y0, "x2":vector.x1, "y2":vector.y1, "gradientUnits":"objectBoundingBox"});
    }
    if (gradient.transform) {
      this.setAttribute_(fillDomElement, "gradientTransform", gradient.transform.toString());
    }
  }
  return gradient.id();
};
acgraph.vector.svg.Renderer.prototype.applyFill = function(element) {
  var fill = (element.fill());
  var defs = element.getStage().getDefs();
  var pathPrefix = "url(" + acgraph.getReference() + "#";
  if (goog.isString(fill)) {
    this.setAttribute_(element.domElement(), "fill", (fill));
    this.removeAttribute_(element.domElement(), "fill-opacity");
  } else {
    if (goog.isArray(fill["keys"]) && fill["cx"] && fill["cy"]) {
      this.setAttribute_(element.domElement(), "fill", pathPrefix + this.renderRadialGradient((fill), defs) + ")");
      this.removeAttribute_(element.domElement(), "fill-opacity");
    } else {
      if (goog.isArray(fill["keys"])) {
        if (!element.getBounds()) {
          return;
        }
        this.setAttribute_(element.domElement(), "fill", pathPrefix + this.renderLinearGradient((fill), defs, element.getBounds()) + ")");
        this.removeAttribute_(element.domElement(), "fill-opacity");
      } else {
        if (fill["src"]) {
          var b = element.getBoundsWithoutTransform();
          if (b) {
            b.width = b.width || 0;
            b.height = b.height || 0;
            b.left = b.left || 0;
            b.top = b.top || 0;
          } else {
            b = new acgraph.math.Rect(0, 0, 0, 0);
          }
          if (fill["mode"] == acgraph.vector.ImageFillMode.TILE) {
            var callback = function(imageFill) {
              imageFill.id();
              imageFill.parent(element.getStage()).render();
              acgraph.getRenderer().setAttribute_(element.domElement(), "fill", pathPrefix + imageFill.id() + ")");
            };
            defs.getImageFill(fill["src"], b, fill["mode"], fill["opacity"], callback);
          } else {
            var imageFill = defs.getImageFill(fill["src"], b, fill["mode"], fill["opacity"]);
            imageFill.id();
            imageFill.parent(element.getStage()).render();
            this.setAttribute_(element.domElement(), "fill", pathPrefix + imageFill.id() + ")");
          }
        } else {
          if (fill instanceof acgraph.vector.HatchFill) {
            var hatch = (fill);
            hatch = defs.getHatchFill(hatch.type, hatch.color, hatch.thickness, hatch.size);
            hatch.id();
            hatch.parent(element.getStage()).render();
            this.setAttribute_(element.domElement(), "fill", pathPrefix + hatch.id() + ")");
          } else {
            if (fill instanceof acgraph.vector.PatternFill) {
              var pattern = (fill);
              pattern.id();
              pattern.parent(element.getStage()).render();
              this.setAttribute_(element.domElement(), "fill", pathPrefix + pattern.id() + ")");
            } else {
              if (fill["opacity"] <= 1E-4 && goog.userAgent.IE && goog.userAgent.isVersionOrHigher("9")) {
                fill["opacity"] = 1E-4;
              }
              this.setAttributes_(element.domElement(), {"fill":(fill)["color"], "fill-opacity":(fill)["opacity"]});
            }
          }
        }
      }
    }
  }
};
acgraph.vector.svg.Renderer.prototype.applyStroke = function(element) {
  var stroke = (element.stroke());
  var defs = element.getStage().getDefs();
  var domElement = element.domElement();
  var pathPrefix = "url(" + acgraph.getReference() + "#";
  if (goog.isString(stroke)) {
    this.setAttribute_(domElement, "stroke", (stroke));
  } else {
    if (goog.isArray(stroke["keys"]) && stroke["cx"] && stroke["cy"]) {
      this.setAttribute_(domElement, "stroke", pathPrefix + this.renderRadialGradient((stroke), defs) + ")");
    } else {
      if (goog.isArray(stroke["keys"])) {
        if (!element.getBounds()) {
          return;
        }
        this.setAttribute_(domElement, "stroke", pathPrefix + this.renderLinearGradient((stroke), defs, element.getBounds()) + ")");
      } else {
        this.setAttribute_(domElement, "stroke", stroke["color"]);
      }
    }
  }
  if (stroke["lineJoin"]) {
    this.setAttribute_(domElement, "stroke-linejoin", stroke["lineJoin"]);
  } else {
    this.removeAttribute_(domElement, "stroke-linejoin");
  }
  if (stroke["lineCap"]) {
    this.setAttribute_(domElement, "stroke-linecap", stroke["lineCap"]);
  } else {
    this.removeAttribute_(domElement, "stroke-linecap");
  }
  if (stroke["opacity"]) {
    this.setAttribute_(domElement, "stroke-opacity", stroke["opacity"]);
  } else {
    this.removeAttribute_(domElement, "stroke-opacity");
  }
  if (stroke["thickness"]) {
    this.setAttribute_(domElement, "stroke-width", stroke["thickness"]);
  } else {
    this.removeAttribute_(domElement, "stroke-width");
  }
  if (stroke["dash"]) {
    this.setAttribute_(domElement, "stroke-dasharray", stroke["dash"]);
  } else {
    this.removeAttribute_(domElement, "stroke-dasharray");
  }
};
acgraph.vector.svg.Renderer.prototype.applyFillAndStroke = function(element) {
  this.applyFill(element);
  this.applyStroke(element);
};
acgraph.vector.svg.Renderer.prototype.setVisible = function(element) {
  if (element.visible()) {
    this.removeAttribute_(element.domElement(), "visibility");
  } else {
    this.setAttribute_(element.domElement(), "visibility", "hidden");
  }
};
acgraph.vector.svg.Renderer.prototype.setTransformation = function(element) {
  var transformation = element.getSelfTransformation();
  if (transformation && !transformation.isIdentity()) {
    this.setAttribute_(element.domElement(), "transform", transformation.toString());
  } else {
    this.removeAttribute_(element.domElement(), "transform");
  }
};
acgraph.vector.svg.Renderer.prototype.setPatternTransformation = function(element) {
  var transformation = element.getSelfTransformation();
  if (transformation && !transformation.isIdentity()) {
    this.setAttribute_(element.domElement(), "patternTransform", transformation.toString());
  } else {
    this.removeAttribute_(element.domElement(), "patternTransform");
  }
};
acgraph.vector.svg.Renderer.prototype.setPathTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;
acgraph.vector.svg.Renderer.prototype.setImageTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;
acgraph.vector.svg.Renderer.prototype.setLayerTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;
acgraph.vector.svg.Renderer.prototype.setTextTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;
acgraph.vector.svg.Renderer.prototype.setRectTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;
acgraph.vector.svg.Renderer.prototype.setEllipseTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;
acgraph.vector.svg.Renderer.prototype.setStageSize = function(el, width, height) {
  this.setAttributes_(el, {"width":width, "height":height});
};
acgraph.vector.svg.Renderer.prototype.setId = function(element, id) {
  this.setIdInternal(element.domElement(), id);
};
acgraph.vector.svg.Renderer.prototype.setIdInternal = function(element, id) {
  if (element) {
    if (id) {
      this.setAttribute_(element, "id", id);
    } else {
      this.removeAttribute_(element, "id");
    }
  }
};
acgraph.vector.svg.Renderer.prototype.setTitle = function(element, title) {
  var domElement = element.domElement();
  if (domElement) {
    if (goog.isDefAndNotNull(title)) {
      if (!element.titleElement) {
        element.titleElement = this.createSVGElement_("title");
        this.setAttribute_(element.titleElement, "aria-label", "");
      }
      if (!goog.dom.getParentElement(element.titleElement)) {
        goog.dom.insertChildAt(domElement, element.titleElement, 0);
      }
      element.titleElement.innerHTML = title;
    } else {
      if (element.titleElement) {
        domElement.removeChild(element.titleElement);
      }
    }
  }
};
acgraph.vector.svg.Renderer.prototype.setDesc = function(element, desc) {
  var domElement = element.domElement();
  if (domElement) {
    if (goog.isDefAndNotNull(desc)) {
      if (!element.descElement) {
        element.descElement = this.createSVGElement_("desc");
        this.setAttribute_(element.descElement, "aria-label", "");
      }
      if (!goog.dom.getParentElement(element.descElement)) {
        goog.dom.insertChildAt(domElement, element.descElement, 0);
      }
      element.descElement.innerHTML = desc;
    } else {
      if (element.descElement) {
        domElement.removeChild(element.descElement);
      }
    }
  }
};
acgraph.vector.svg.Renderer.prototype.setAttributes = function(element, attrs) {
  var domElement = element.domElement();
  if (domElement && goog.isObject(attrs)) {
    for (var key in attrs) {
      var value = attrs[key];
      if (goog.isNull(value)) {
        this.removeAttribute_(domElement, key);
      } else {
        this.setAttribute_(domElement, key, (value));
      }
    }
  }
};
acgraph.vector.svg.Renderer.prototype.getAttribute = function(element, key) {
  return element ? element.getAttribute(key) : void 0;
};
acgraph.vector.svg.Renderer.prototype.setDisableStrokeScaling = function(element, isDisabled) {
  var domElement = element.domElement();
  if (domElement) {
    if (isDisabled) {
      this.setAttribute_(domElement, "vector-effect", "non-scaling-stroke");
    } else {
      this.removeAttribute_(domElement, "vector-effect");
    }
  }
};
acgraph.vector.svg.Renderer.prototype.setLayerSize = goog.nullFunction;
acgraph.vector.svg.Renderer.prototype.setRectProperties = function(rect) {
  var boundsWithoutTransform = rect.getBoundsWithoutTransform();
  this.setAttributes_(rect.domElement(), {"x":boundsWithoutTransform.left, "y":boundsWithoutTransform.top, "width":boundsWithoutTransform.width, "height":boundsWithoutTransform.height});
};
acgraph.vector.svg.Renderer.prototype.setCircleProperties = function(circle) {
  this.setAttributes_(circle.domElement(), {"cx":circle.centerX(), "cy":circle.centerY(), "r":circle.radius()});
};
acgraph.vector.svg.Renderer.prototype.setEllipseProperties = function(ellipse) {
  this.setAttributes_(ellipse.domElement(), {"cx":ellipse.centerX(), "cy":ellipse.centerY(), "rx":ellipse.radiusX(), "ry":ellipse.radiusY()});
};
acgraph.vector.svg.Renderer.prototype.setPathProperties = function(path) {
  var pathData = this.getSvgPath_(path);
  if (pathData) {
    this.setAttribute_(path.domElement(), "d", pathData);
  } else {
    this.setAttribute_(path.domElement(), "d", "M 0,0");
  }
};
acgraph.vector.svg.Renderer.prototype.createClip_ = function(element, clipElement) {
  var defs = (element.getStage().getDefs());
  var clipDomElement = defs.getClipPathElement(clipElement);
  var id = acgraph.utils.IdGenerator.getInstance().identify(clipDomElement, acgraph.utils.IdGenerator.ElementTypePrefix.CLIP);
  var clipShapeElement;
  if (goog.dom.getParentElement(clipDomElement) != defs.domElement()) {
    this.setAttribute_(clipDomElement, "clip-rule", "nonzero");
    this.setIdInternal(clipDomElement, id);
  }
  clipElement.stage(element.getStage());
  clipElement.id(id);
  var clipShape = clipElement.shape();
  clipShape.render();
  clipShapeElement = clipShape.domElement();
  if (clipShapeElement) {
    this.appendChild(clipDomElement, clipShapeElement);
    this.appendChild(defs.domElement(), clipDomElement);
  }
  return id;
};
acgraph.vector.svg.Renderer.prototype.disposeClip = function(clip) {
  var elements = clip.getElements();
  for (var i = 0;i < elements.length;i++) {
    if (elements[i].domElement()) {
      this.removeClip_(elements[i]);
    }
    elements[i].clip(null);
  }
  var clipId = (clip.id());
  var clipPath = goog.dom.getElement(clipId);
  if (clipPath) {
    var clipPathElement = goog.dom.getFirstElementChild(clipPath);
    this.removeNode(clipPathElement);
    this.removeNode(clipPath);
  }
};
acgraph.vector.svg.Renderer.prototype.addClip_ = function(element, clipId) {
  var pathPrefix = acgraph.getReference();
  this.setAttributes_(element.domElement(), {"clip-path":"url(" + pathPrefix + "#" + clipId + ")", "clipPathUnits":"userSpaceOnUse"});
};
acgraph.vector.svg.Renderer.prototype.removeClip_ = function(element) {
  this.removeAttribute_(element.domElement(), "clip-path");
  this.removeAttribute_(element.domElement(), "clipPathUnits");
};
acgraph.vector.svg.Renderer.prototype.updateClip = function(clipElement) {
  var clipShape = clipElement.shape();
  var dom = clipShape.domElement();
  if (!dom) {
    var defs = (clipElement.getStage().getDefs());
    var clipDomElement = defs.getClipPathElement(clipElement);
    clipShape.render();
    var clipShapeElement = clipShape.domElement();
    this.appendChild(clipDomElement, clipShapeElement);
  } else {
    clipElement.shape().render();
  }
};
acgraph.vector.svg.Renderer.prototype.setClip = function(element) {
  var clipelement = (element.clip());
  if (clipelement) {
    var clipId;
    if (clipelement instanceof acgraph.vector.Clip) {
      clipId = (clipelement.id());
    }
    if (!clipId) {
      clipId = this.createClip_(element, clipelement);
    }
    this.addClip_(element, clipId);
  } else {
    this.removeClip_(element);
  }
};
acgraph.vector.svg.Renderer.prototype.setPointerEvents = function(element) {
  if (element.disablePointerEvents()) {
    this.setAttribute_(element.domElement(), "pointer-events", "none");
  } else {
    this.removeAttribute_(element.domElement(), "pointer-events");
  }
};
acgraph.vector.svg.Renderer.prototype.getPathStringFromRect_ = function(rect) {
  var left = rect.left;
  var top = rect.top;
  var right = left + rect.width;
  var bottom = top + rect.height;
  return ["M", left, top, "L", right, top, right, bottom, left, bottom, "Z"].join(" ");
};
acgraph.vector.svg.Renderer.prototype.setPrintAttributes = function(element, stage) {
  this.setAttribute_(element, "width", "100%");
  this.setAttribute_(element, "height", "100%");
  this.setAttribute_(element, "viewBox", "0 0 " + stage.width() + " " + stage.height());
  goog.style.setStyle(element, "width", "100%");
  goog.style.setStyle(element, "height", "");
  goog.style.setStyle(element, "max-height", "100%");
};
goog.provide("acgraph.vector.vml.ShapeType");
goog.require("acgraph.utils.IdGenerator");
goog.require("goog.Disposable");
acgraph.vector.vml.ShapeType = function(fill, stroke) {
  goog.base(this);
  this.fill_ = fill;
  this.stroke_ = stroke;
};
goog.inherits(acgraph.vector.vml.ShapeType, goog.Disposable);
acgraph.vector.vml.ShapeType.prototype.getFill = function() {
  return this.fill_;
};
acgraph.vector.vml.ShapeType.prototype.setFill = function(value) {
  this.fill_ = value;
};
acgraph.vector.vml.ShapeType.prototype.removeFill = function() {
  delete this.fill_;
  acgraph.vector.vml.Renderer.getInstance().removeNode(this.fillDomElement);
  this.fillDomElement = null;
};
acgraph.vector.vml.ShapeType.prototype.fillDomElement = null;
acgraph.vector.vml.ShapeType.prototype.strokeDomElement = null;
acgraph.vector.vml.ShapeType.prototype.rendered = false;
acgraph.vector.vml.ShapeType.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.SHAPE_TYPE;
};
acgraph.vector.vml.ShapeType.prototype.disposeInternal = function() {
  delete this.fill_;
  delete this.stroke_;
  acgraph.vector.vml.Renderer.getInstance().removeNode(this.fillDomElement);
  this.fillDomElement = null;
  acgraph.vector.vml.Renderer.getInstance().removeNode(this.strokeDomElement);
  this.strokeDomElement = null;
};
goog.provide("acgraph.vector.vml.Defs");
goog.require("acgraph.vector.Defs");
goog.require("acgraph.vector.vml.RadialGradient");
goog.require("acgraph.vector.vml.ShapeType");
acgraph.vector.vml.Defs = function(stage) {
  goog.base(this, stage);
  this.shapeTypes_ = {};
  this.radialVMLGradients_ = {};
};
goog.inherits(acgraph.vector.vml.Defs, acgraph.vector.Defs);
acgraph.vector.vml.Defs.prototype.clear = function() {
  goog.object.clear(this.shapeTypes_);
  goog.object.clear(this.radialVMLGradients_);
  goog.base(this, "clear");
};
acgraph.vector.vml.Defs.prototype.getShapeType = function(fill, stroke) {
  var shapeTypeId = "" + this.serializeFill(fill) + this.serializeStroke(stroke);
  if (goog.object.containsKey(this.shapeTypes_, shapeTypeId)) {
    return this.shapeTypes_[shapeTypeId];
  }
  var shapeType = new acgraph.vector.vml.ShapeType(fill, stroke);
  this.shapeTypes_[shapeTypeId] = shapeType;
  return shapeType;
};
acgraph.vector.vml.Defs.prototype.serializeFill = function(fill) {
  var stringParam = "";
  if (goog.isString(fill)) {
    stringParam += fill + "1";
  } else {
    if (fill instanceof acgraph.vector.RadialGradient) {
      var rg = (fill);
      stringParam = acgraph.vector.vml.RadialGradient.serialize(rg.keys, rg.cx, rg.cy, rg.size_x, rg.size_y, rg.opacity, rg.bounds);
    } else {
      if (fill instanceof acgraph.vector.LinearGradient) {
        var lg = (fill);
        stringParam = acgraph.vector.LinearGradient.serialize(lg.keys, lg.opacity, lg.angle, lg.mode);
      } else {
        stringParam += fill["color"] + fill["opacity"];
      }
    }
  }
  return stringParam;
};
acgraph.vector.vml.Defs.prototype.getVMLRadialGradient = function(keys, cx, cy, size_x, size_y, opacity, opt_mode) {
  var bounds = goog.isDefAndNotNull(opt_mode) ? opt_mode : null;
  var id = acgraph.vector.vml.RadialGradient.serialize(keys, cx, cy, size_x, size_y, opacity, bounds);
  if (goog.object.containsKey(this.radialVMLGradients_, id)) {
    return this.radialVMLGradients_[id];
  }
  return this.radialVMLGradients_[id] = new acgraph.vector.vml.RadialGradient(keys, cx, cy, size_x, size_y, opacity, bounds);
};
acgraph.vector.vml.Defs.prototype.removeRadialGradient = function(element) {
  var id = acgraph.vector.RadialGradient.serialize(element.keys, element.cx, element.cy, element.size_x, element.size_y, element.opacity, element.bounds);
  var shapeTypes = (goog.object.getValues(this.shapeTypes_));
  for (var i = 0, len = shapeTypes.length;i < len;i++) {
    var shapeType = shapeTypes[i];
    if (shapeType.getFill() == element) {
      shapeType.removeFill();
    }
  }
  if (goog.object.containsKey(this.radialVMLGradients_, id)) {
    goog.object.remove(this.radialVMLGradients_, id);
  }
};
acgraph.vector.vml.Defs.prototype.removeLinearGradient = function(element) {
  var id = acgraph.vector.LinearGradient.serialize(element.keys, element.opacity, element.angle, element.mode);
  var shapeTypes = (goog.object.getValues(this.shapeTypes_));
  for (var i = 0, len = shapeTypes.length;i < len;i++) {
    var shapeType = shapeTypes[i];
    if (shapeType.getFill() == element) {
      shapeType.removeFill();
    }
  }
  var linearGradients = this.getLinearGradients();
  if (goog.object.containsKey(linearGradients, id)) {
    goog.object.remove(linearGradients, id);
  }
};
acgraph.vector.vml.Defs.prototype.serializeStroke = function(value) {
  var strokeColor;
  if (goog.isString(value)) {
    strokeColor = (value);
  } else {
    if ("keys" in value) {
      var obj = value["keys"].length != 0 ? value["keys"][0] : value;
      strokeColor = obj["color"] || "black";
      strokeColor += "opacity" in obj ? obj["opacity"] : 1;
    } else {
      strokeColor = value["color"];
      strokeColor += "opacity" in value ? value["opacity"] : 1;
    }
  }
  return "" + value["thickness"] + strokeColor + value["lineJoin"] + value["lineCap"] + value["dash"];
};
acgraph.vector.vml.Defs.prototype.disposeInternal = function() {
  for (var i in this.shapeTypes_) {
    goog.dispose(this.shapeTypes_[i]);
  }
  this.shapeTypes_ = null;
  goog.base(this, "disposeInternal");
};
goog.provide("acgraph.vector.vml.Stage");
goog.require("acgraph.vector.Stage");
goog.require("acgraph.vector.vml.Clip");
goog.require("acgraph.vector.vml.Defs");
acgraph.vector.vml.Stage = function(opt_container, opt_width, opt_height) {
  goog.base(this, opt_container, opt_width, opt_height);
};
goog.inherits(acgraph.vector.vml.Stage, acgraph.vector.Stage);
acgraph.vector.vml.Stage.prototype.createDefs = function() {
  return new acgraph.vector.vml.Defs(this);
};
acgraph.vector.vml.Stage.prototype.createClip = function(opt_leftOrRect, opt_top, opt_width, opt_height) {
  return new acgraph.vector.vml.Clip(this, opt_leftOrRect, opt_top, opt_width, opt_height);
};
goog.provide("acgraph.vector.vml.Text");
goog.require("acgraph.math.Rect");
goog.require("acgraph.vector.Text");
acgraph.vector.vml.Text = function(opt_x, opt_y) {
  goog.base(this, opt_x, opt_y);
  this.simpleText_ = null;
  this.isComplex_ = false;
  this.transformationCache = null;
};
goog.inherits(acgraph.vector.vml.Text, acgraph.vector.Text);
acgraph.vector.Element.prototype.skew;
acgraph.vector.vml.Text.prototype.getSimpleText = function() {
  return this.simpleText_;
};
acgraph.vector.vml.Text.prototype.textOverflow = function(opt_value) {
  if (opt_value) {
    this.isComplex_ = true;
  }
  return goog.base(this, "textOverflow", opt_value);
};
acgraph.vector.vml.Text.prototype.opacity = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value !== this.style()["opacity"]) {
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) {
        this.getStage().suspend();
      }
      this.style()["opacity"] = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
      this.transformAfterChange();
      if (!stageSuspended) {
        this.getStage().resume();
      }
    }
    return this;
  }
  return this.style()["opacity"];
};
acgraph.vector.vml.Text.prototype.color = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value !== this.style()["color"]) {
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) {
        this.getStage().suspend();
      }
      this.style()["color"] = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
      this.transformAfterChange();
      if (!stageSuspended) {
        this.getStage().resume();
      }
    }
    return this;
  }
  return this.style()["color"];
};
acgraph.vector.vml.Text.prototype.transformAfterChange = function() {
  if (acgraph.getRenderer().needsReRenderOnParentTransformationChange()) {
    var tx = this.getFullTransformation();
    if (tx && !tx.isIdentity()) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
      this.transformationCache = null;
    }
  }
};
acgraph.vector.vml.Text.prototype.isSimpleTransformation_ = function() {
  var tx = this.getFullTransformation();
  return !tx || !!tx && tx.getScaleX() == 1 && tx.getShearX() == 0 && tx.getShearY() == 0 && tx.getScaleY() == 1;
};
acgraph.vector.vml.Text.prototype.isComplex = function() {
  return !this.isSimpleTransformation_() || !!this.textOverflow();
};
acgraph.vector.vml.Text.prototype.getBoundsWithTransform = function(transform) {
  this.isComplex_ = this.isComplex();
  return goog.base(this, "getBoundsWithTransform", transform);
};
acgraph.vector.vml.Text.prototype.render = function() {
  goog.base(this, "render");
  if (this.isScaleOrShearChanged() || this.textOverflow()) {
    acgraph.getRenderer().textEarsFeint(this);
  }
  return this;
};
acgraph.vector.vml.Text.prototype.renderPosition = function() {
  if (this.isComplex_) {
    goog.base(this, "renderPosition");
  } else {
    acgraph.getRenderer().setTextPosition(this);
    this.clearDirtyState(acgraph.vector.Element.DirtyState.POSITION);
  }
};
acgraph.vector.vml.Text.prototype.renderData = function() {
  if (this.isComplex_) {
    goog.base(this, "renderData");
  } else {
    this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }
};
acgraph.vector.vml.Text.prototype.textDefragmentation = function() {
  if (this.isComplex_) {
    goog.base(this, "textDefragmentation");
  } else {
    if (goog.isDefAndNotNull(this.direction())) {
      this.rtl = this.direction() == acgraph.vector.Text.Direction.RTL;
    }
    var text = (this.text());
    if (!this.isHtml() && this.text() != null) {
      this.simpleText_ = goog.string.newLineToBr(text);
    } else {
      this.simpleText_ = text;
    }
    this.bounds = this.getTextBounds((this.simpleText_), {});
  }
};
acgraph.vector.vml.Text.prototype.getTextBounds = function(text, segmentStyle) {
  if (this.isComplex_) {
    return goog.base(this, "getTextBounds", text, segmentStyle);
  } else {
    var bounds = acgraph.getRenderer().measuringSimpleText(text, segmentStyle, this.style());
    bounds.left = this.x();
    bounds.top = this.y();
    this.realHeigth = bounds.height;
    if (this.height()) {
      bounds.height = this.height();
    }
    return bounds;
  }
};
acgraph.vector.vml.Text.prototype.isScaleOrShearChanged = function() {
  var changed;
  var txCache = this.transformationCache;
  var tx = this.getFullTransformation();
  if (goog.isNull(txCache) && goog.isNull(tx)) {
    changed = false;
  } else {
    if (goog.isNull(txCache) || goog.isNull(tx)) {
      changed = true;
    } else {
      changed = !(tx.getScaleX() == txCache.getScaleX() && tx.getShearX() == txCache.getShearX() && tx.getShearY() == txCache.getShearY() && tx.getScaleY() == txCache.getScaleY());
    }
  }
  return changed;
};
acgraph.vector.vml.Text.prototype.beforeTransformationChanged = function() {
  var tx = this.getFullTransformation();
  if (tx && !(this.hasDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION) || this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION))) {
    this.transformationCache = tx.clone();
  }
};
acgraph.vector.vml.Text.prototype.transformationChanged_ = function() {
  var complexityCache = this.isComplex_;
  this.isComplex_ = this.isComplex();
  var switchToComplexity = !complexityCache && this.isComplex_;
  var switchToSimple = complexityCache && !this.isComplex_;
  var stageSuspended = !this.getStage() || this.getStage().isSuspended();
  if (!stageSuspended) {
    this.getStage().suspend();
  }
  if (switchToComplexity) {
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.bounds = new acgraph.math.Rect((this.x()), (this.y()), this.width_, this.height_);
  } else {
    if (switchToSimple) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
      this.bounds = this.getTextBounds((this.simpleText_), {});
    }
  }
  if (!stageSuspended) {
    this.getStage().resume();
  }
};
acgraph.vector.vml.Text.prototype.parentTransformationChanged = function() {
  goog.base(this, "parentTransformationChanged");
  this.transformationChanged_();
};
acgraph.vector.vml.Text.prototype.transformationChanged = function() {
  goog.base(this, "transformationChanged");
  this.transformationChanged_();
  if (acgraph.vector.vml.Renderer.IE8_MODE && this.isScaleOrShearChanged()) {
    var stageSuspended = !this.getStage() || this.getStage().isSuspended();
    if (!stageSuspended) {
      this.getStage().suspend();
    }
    this.defragmented = false;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.transformAfterChange();
    if (!stageSuspended) {
      this.getStage().resume();
    }
  }
};
acgraph.vector.vml.Text.prototype.disposeInternal = function() {
  delete this.transformationCache;
  goog.base(this, "disposeInternal");
};
acgraph.vector.vml.Text.prototype["color"] = acgraph.vector.vml.Text.prototype.color;
acgraph.vector.vml.Text.prototype["opacity"] = acgraph.vector.vml.Text.prototype.opacity;
acgraph.vector.vml.Text.prototype["textOverflow"] = acgraph.vector.vml.Text.prototype.textOverflow;
goog.provide("acgraph.vector.primitives");
goog.require("acgraph.vector.Path");
acgraph.vector.primitives.star = function(stageOrPath, centerX, centerY, outerRadius, innerRadius, numberOfSpikes, opt_startDegrees, opt_curvature) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  if (numberOfSpikes < 2) {
    return path;
  }
  var currentAngle = opt_startDegrees || 0;
  var currentX = goog.math.angleDx(currentAngle, outerRadius);
  var currentY = goog.math.angleDy(currentAngle, outerRadius);
  var step = 360 / (numberOfSpikes * 2);
  var i;
  path.moveTo(currentX + centerX, currentY + centerY);
  if (opt_curvature) {
    for (i = 0;i < numberOfSpikes;i++) {
      var prevAngle = currentAngle;
      currentAngle += step;
      var prevX = currentX;
      var prevY = currentY;
      var innerX = goog.math.angleDx(prevAngle, innerRadius);
      var innerY = goog.math.angleDy(prevAngle, innerRadius);
      var outerX = goog.math.angleDx(currentAngle, outerRadius);
      var outerY = goog.math.angleDy(currentAngle, outerRadius);
      currentX = goog.math.angleDx(currentAngle, innerRadius);
      currentY = goog.math.angleDy(currentAngle, innerRadius);
      var u = (outerX - innerX) * (prevY - innerY) - (outerY - innerY) * (prevX - innerX);
      u /= (outerY - innerY) * (currentX - prevX) - (outerX - innerX) * (currentY - prevY);
      var controlX = acgraph.vector.primitives.getCurvedLineControlX_(innerRadius, outerRadius, prevAngle, currentAngle, opt_curvature, 1 - u);
      var controlY = acgraph.vector.primitives.getCurvedLineControlY_(innerRadius, outerRadius, prevAngle, currentAngle, opt_curvature, 1 - u);
      path.quadraticCurveTo(centerX + controlX, centerY + controlY, centerX + currentX, centerY + currentY);
      prevAngle = currentAngle;
      currentAngle += step;
      prevX = currentX;
      prevY = currentY;
      innerX = goog.math.angleDx(currentAngle, innerRadius);
      innerY = goog.math.angleDy(currentAngle, innerRadius);
      outerX = goog.math.angleDx(prevAngle, outerRadius);
      outerY = goog.math.angleDy(prevAngle, outerRadius);
      currentX = goog.math.angleDx(currentAngle, outerRadius);
      currentY = goog.math.angleDy(currentAngle, outerRadius);
      u = (outerX - innerX) * (prevY - innerY) - (outerY - innerY) * (prevX - innerX);
      u /= (outerY - innerY) * (currentX - prevX) - (outerX - innerX) * (currentY - prevY);
      controlX = acgraph.vector.primitives.getCurvedLineControlX_(innerRadius, outerRadius, currentAngle, prevAngle, opt_curvature, u);
      controlY = acgraph.vector.primitives.getCurvedLineControlY_(innerRadius, outerRadius, currentAngle, prevAngle, opt_curvature, u);
      path.quadraticCurveTo(centerX + controlX, centerY + controlY, centerX + currentX, centerY + currentY);
    }
  } else {
    for (i = 0;i < numberOfSpikes;i++) {
      currentAngle += step;
      currentX = goog.math.angleDx(currentAngle, innerRadius);
      currentY = goog.math.angleDy(currentAngle, innerRadius);
      path.lineTo(centerX + currentX, centerY + currentY);
      currentAngle += step;
      currentX = goog.math.angleDx(currentAngle, outerRadius);
      currentY = goog.math.angleDy(currentAngle, outerRadius);
      path.lineTo(centerX + currentX, centerY + currentY);
    }
  }
  path.close();
  return path;
};
acgraph.vector.primitives.star4 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius / 2, 4);
};
acgraph.vector.primitives.star5 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius / 2, 5, -90);
};
acgraph.vector.primitives.star6 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * .5773502691896258, 6, -90);
};
acgraph.vector.primitives.star7 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius / 2, 7, -90);
};
acgraph.vector.primitives.star10 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * .8506508083520399, 10);
};
acgraph.vector.primitives.triangleUp = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * .5, 3, -90);
};
acgraph.vector.primitives.triangleDown = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * .5, 3, 90);
};
acgraph.vector.primitives.triangleRight = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * .5, 3, 0);
};
acgraph.vector.primitives.triangleLeft = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * .5, 3, 180);
};
acgraph.vector.primitives.diamond = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * Math.SQRT1_2, 4);
};
acgraph.vector.primitives.cross = function(stageOrPath, centerX, centerY, outerRadius) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  var halfW = outerRadius / 4;
  var left = centerX - outerRadius;
  var right = centerX + outerRadius;
  var top = centerY - outerRadius;
  var bottom = centerY + outerRadius;
  path.moveTo(centerX - halfW, top).lineTo(centerX - halfW, centerY - halfW).lineTo(left, centerY - halfW).lineTo(left, centerY + halfW).lineTo(centerX - halfW, centerY + halfW).lineTo(centerX - halfW, bottom).lineTo(centerX + halfW, bottom).lineTo(centerX + halfW, centerY + halfW).lineTo(right, centerY + halfW).lineTo(right, centerY - halfW).lineTo(centerX + halfW, centerY - halfW).lineTo(centerX + halfW, top).close();
  return path;
};
acgraph.vector.primitives.diagonalCross = function(stageOrPath, centerX, centerY, outerRadius) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  var d = outerRadius * Math.SQRT1_2 / 2;
  var left = centerX - outerRadius;
  var right = centerX + outerRadius;
  var top = centerY - outerRadius;
  var bottom = centerY + outerRadius;
  path.moveTo(left + d, top).lineTo(centerX, centerY - d).lineTo(right - d, top).lineTo(right, top + d).lineTo(centerX + d, centerY).lineTo(right, bottom - d).lineTo(right - d, bottom).lineTo(centerX, centerY + d).lineTo(left + d, bottom).lineTo(left, bottom - d).lineTo(centerX - d, centerY).lineTo(left, top + d).close();
  return path;
};
acgraph.vector.primitives.hLine = function(stageOrPath, centerX, centerY, outerRadius) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  var halfW = outerRadius / 4;
  var left = centerX - outerRadius;
  var right = centerX + outerRadius;
  path.moveTo(right, centerY - halfW).lineTo(right, centerY + halfW).lineTo(left, centerY + halfW).lineTo(left, centerY - halfW).close();
  return path;
};
acgraph.vector.primitives.vLine = function(stageOrPath, centerX, centerY, outerRadius) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  var halfW = outerRadius / 4;
  var top = centerY - outerRadius;
  var bottom = centerY + outerRadius;
  path.moveTo(centerX - halfW, top).lineTo(centerX + halfW, top).lineTo(centerX + halfW, bottom).lineTo(centerX - halfW, bottom).close();
  return path;
};
acgraph.vector.primitives.pie = function(stageOrPath, cx, cy, r, start, sweep) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  sweep = goog.math.clamp(sweep, -360, 360);
  if (Math.abs(sweep) == 360) {
    path.circularArc(cx, cy, r, r, start, sweep, false);
  } else {
    path.moveTo(cx, cy).circularArc(cx, cy, r, r, start, sweep, true).close();
  }
  return path;
};
acgraph.vector.primitives.donut = function(stageOrPath, cx, cy, outerR, innerR, start, sweep) {
  if (outerR < 0) {
    outerR = 0;
  }
  if (innerR < 0) {
    innerR = 0;
  }
  if (outerR < innerR) {
    var tmp = outerR;
    outerR = innerR;
    innerR = tmp;
  }
  if (innerR <= 0) {
    return acgraph.vector.primitives.pie(stageOrPath, cx, cy, outerR, start, sweep);
  }
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  sweep = goog.math.clamp(sweep, -360, 360);
  var drawSides = Math.abs(sweep) < 360;
  path.circularArc(cx, cy, outerR, outerR, start, sweep).circularArc(cx, cy, innerR, innerR, start + sweep, -sweep, drawSides);
  if (drawSides) {
    path.close();
  }
  return path;
};
acgraph.vector.primitives.getCurvedLineControlX_ = function(innerRadius, outerRadius, innerAngle, outerAngle, curvature, u) {
  var innerX = goog.math.angleDx(innerAngle, innerRadius);
  var outerX = goog.math.angleDx(outerAngle, outerRadius);
  var len = outerX - innerX;
  if (curvature >= 0) {
    return innerX + len * (u + curvature - u * curvature);
  } else {
    return innerX + len * u * (curvature + 1);
  }
};
acgraph.vector.primitives.getCurvedLineControlY_ = function(innerRadius, outerRadius, innerAngle, outerAngle, curvature, u) {
  var innerY = goog.math.angleDy(innerAngle, innerRadius);
  var outerY = goog.math.angleDy(outerAngle, outerRadius);
  var len = outerY - innerY;
  if (curvature >= 0) {
    return innerY + len * (u + curvature - u * curvature);
  } else {
    return innerY + len * u * (curvature + 1);
  }
};
acgraph.vector.primitives.normalizeCornerRadiiSet_ = function(radiusOfCorners) {
  var topRight, bottomRight, bottomLeft;
  switch(radiusOfCorners.length) {
    case 1:
      topRight = bottomRight = bottomLeft = radiusOfCorners[0];
      radiusOfCorners.push(topRight, bottomRight, bottomLeft);
      break;
    case 2:
      bottomRight = radiusOfCorners[0];
      bottomLeft = radiusOfCorners[1];
      radiusOfCorners.push(bottomRight, bottomLeft);
      break;
    case 3:
      bottomLeft = radiusOfCorners[1];
      radiusOfCorners.push(bottomLeft);
      break;
    case 4:
      break;
    case 0:
    ;
    default:
      radiusOfCorners.push(5, 5, 5, 5);
      break;
  }
};
acgraph.vector.primitives.truncatedRect = function(stageOrPath, rect, var_args) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  var topLeft, topRight, bottomRight, bottomLeft;
  if (arguments.length == 6) {
    topLeft = arguments[2];
    topRight = arguments[3];
    bottomRight = arguments[4];
    bottomLeft = arguments[5];
    path.moveTo(rect.left + topLeft, rect.top).lineTo(rect.left + rect.width - topRight, rect.top).lineTo(rect.left + rect.width, rect.top + topRight).lineTo(rect.left + rect.width, rect.top + rect.height - bottomRight).lineTo(rect.left + rect.width - bottomRight, rect.top + rect.height).lineTo(rect.left + bottomLeft, rect.top + rect.height).lineTo(rect.left, rect.top + rect.height - bottomLeft).lineTo(rect.left, rect.top + topLeft).close();
  } else {
    var radiusOfCorners_ = goog.array.slice(arguments, 2, 6);
    acgraph.vector.primitives.normalizeCornerRadiiSet_(radiusOfCorners_);
    topLeft = radiusOfCorners_[0];
    topRight = radiusOfCorners_[1];
    bottomRight = radiusOfCorners_[2];
    bottomLeft = radiusOfCorners_[3];
    acgraph.vector.primitives.truncatedRect(path, rect, topLeft, topRight, bottomRight, bottomLeft);
  }
  return path;
};
acgraph.vector.primitives.roundedRect = function(stageOrPath, rect, var_args) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  var topLeft, topRight, bottomRight, bottomLeft;
  if (arguments.length == 6) {
    topLeft = arguments[2];
    topRight = arguments[3];
    bottomRight = arguments[4];
    bottomLeft = arguments[5];
    path.moveTo(rect.left + topLeft, rect.top).lineTo(rect.left + rect.width - topRight, rect.top).arcToByEndPoint(rect.left + rect.width, rect.top + topRight, topRight, topRight, false, true).lineTo(rect.left + rect.width, rect.top + rect.height - bottomRight).arcToByEndPoint(rect.left + rect.width - bottomRight, rect.top + rect.height, bottomRight, bottomRight, false, true).lineTo(rect.left + bottomLeft, rect.top + rect.height).arcToByEndPoint(rect.left, rect.top + rect.height - bottomLeft, bottomLeft, 
    bottomLeft, false, true);
    if (topLeft != 0) {
      path.lineTo(rect.left, rect.top + topLeft);
      path.arcToByEndPoint(rect.left + topLeft, rect.top, topLeft, topLeft, false, true);
    }
    path.close();
  } else {
    var radiusOfCorners_ = goog.array.slice(arguments, 2, 6);
    acgraph.vector.primitives.normalizeCornerRadiiSet_(radiusOfCorners_);
    topLeft = radiusOfCorners_[0];
    topRight = radiusOfCorners_[1];
    bottomRight = radiusOfCorners_[2];
    bottomLeft = radiusOfCorners_[3];
    acgraph.vector.primitives.roundedRect(path, rect, topLeft, topRight, bottomRight, bottomLeft);
  }
  return path;
};
acgraph.vector.primitives.roundedInnerRect = function(stageOrPath, rect, var_args) {
  var path = stageOrPath.path ? stageOrPath.path() : (stageOrPath);
  var topLeft, topRight, bottomRight, bottomLeft;
  if (arguments.length == 6) {
    topLeft = arguments[2];
    topRight = arguments[3];
    bottomRight = arguments[4];
    bottomLeft = arguments[5];
    path.moveTo(rect.left + topLeft, rect.top).lineTo(rect.left + rect.width - topRight, rect.top).arcToByEndPoint(rect.left + rect.width, rect.top + topRight, topRight, topRight, false, false).lineTo(rect.left + rect.width, rect.top + rect.height - bottomRight).arcToByEndPoint(rect.left + rect.width - bottomRight, rect.top + rect.height, bottomRight, bottomRight, false, false).lineTo(rect.left + bottomLeft, rect.top + rect.height).arcToByEndPoint(rect.left, rect.top + rect.height - bottomLeft, bottomLeft, 
    bottomLeft, false, false);
    if (topLeft != 0) {
      path.lineTo(rect.left, rect.top + topLeft).arcToByEndPoint(rect.left + topLeft, rect.top, topLeft, topLeft, false, false);
    }
    path.close();
  } else {
    var radiusOfCorners_ = goog.array.slice(arguments, 2, 6);
    acgraph.vector.primitives.normalizeCornerRadiiSet_(radiusOfCorners_);
    topLeft = radiusOfCorners_[0];
    topRight = radiusOfCorners_[1];
    bottomRight = radiusOfCorners_[2];
    bottomLeft = radiusOfCorners_[3];
    acgraph.vector.primitives.roundedInnerRect(path, rect, topLeft, topRight, bottomRight, bottomLeft);
  }
  return path;
};
goog.exportSymbol("acgraph.vector.primitives.star", acgraph.vector.primitives.star);
goog.exportSymbol("acgraph.vector.primitives.star4", acgraph.vector.primitives.star4);
goog.exportSymbol("acgraph.vector.primitives.star5", acgraph.vector.primitives.star5);
goog.exportSymbol("acgraph.vector.primitives.star6", acgraph.vector.primitives.star6);
goog.exportSymbol("acgraph.vector.primitives.star7", acgraph.vector.primitives.star7);
goog.exportSymbol("acgraph.vector.primitives.star10", acgraph.vector.primitives.star10);
goog.exportSymbol("acgraph.vector.primitives.diamond", acgraph.vector.primitives.diamond);
goog.exportSymbol("acgraph.vector.primitives.triangleUp", acgraph.vector.primitives.triangleUp);
goog.exportSymbol("acgraph.vector.primitives.triangleDown", acgraph.vector.primitives.triangleDown);
goog.exportSymbol("acgraph.vector.primitives.triangleRight", acgraph.vector.primitives.triangleRight);
goog.exportSymbol("acgraph.vector.primitives.triangleLeft", acgraph.vector.primitives.triangleLeft);
goog.exportSymbol("acgraph.vector.primitives.cross", acgraph.vector.primitives.cross);
goog.exportSymbol("acgraph.vector.primitives.diagonalCross", acgraph.vector.primitives.diagonalCross);
goog.exportSymbol("acgraph.vector.primitives.hLine", acgraph.vector.primitives.hLine);
goog.exportSymbol("acgraph.vector.primitives.vLine", acgraph.vector.primitives.vLine);
goog.exportSymbol("acgraph.vector.primitives.pie", acgraph.vector.primitives.pie);
goog.exportSymbol("acgraph.vector.primitives.donut", acgraph.vector.primitives.donut);
goog.exportSymbol("acgraph.vector.primitives.truncatedRect", acgraph.vector.primitives.truncatedRect);
goog.exportSymbol("acgraph.vector.primitives.roundedRect", acgraph.vector.primitives.roundedRect);
goog.exportSymbol("acgraph.vector.primitives.roundedInnerRect", acgraph.vector.primitives.roundedInnerRect);
goog.provide("acgraph");
goog.require("acgraph.compatibility");
goog.require("acgraph.vector");
goog.require("acgraph.vector.Circle");
goog.require("acgraph.vector.Clip");
goog.require("acgraph.vector.Ellipse");
goog.require("acgraph.vector.HatchFill");
goog.require("acgraph.vector.Image");
goog.require("acgraph.vector.Layer");
goog.require("acgraph.vector.Path");
goog.require("acgraph.vector.PatternFill");
goog.require("acgraph.vector.Rect");
goog.require("acgraph.vector.Renderer");
goog.require("acgraph.vector.Text");
goog.require("acgraph.vector.UnmanagedLayer");
goog.require("acgraph.vector.primitives");
goog.require("acgraph.vector.svg.Renderer");
goog.require("acgraph.vector.svg.Stage");
goog.require("acgraph.vector.vml.Clip");
goog.require("acgraph.vector.vml.Renderer");
goog.require("acgraph.vector.vml.Stage");
goog.require("acgraph.vector.vml.Text");
goog.require("goog.dom");
goog.require("goog.userAgent");
acgraph.WRAPPER_ID_PROP_NAME_ = "data-ac-wrapper-id";
acgraph.wrappers_ = {};
acgraph.register = function(wrapper) {
  var node = wrapper.domElement();
  if (node) {
    var id = String(goog.getUid(wrapper));
    acgraph.wrappers_[id] = wrapper;
    node.setAttribute(acgraph.WRAPPER_ID_PROP_NAME_, id);
  }
};
acgraph.unregister = function(wrapper) {
  delete acgraph.wrappers_[String(goog.getUid(wrapper))];
  var node = wrapper.domElement();
  if (node) {
    node.removeAttribute(acgraph.WRAPPER_ID_PROP_NAME_);
  }
};
acgraph.getWrapperForDOM = function(node, stage) {
  var uid;
  var domRoot = stage.domElement().parentNode;
  while (node && node != domRoot) {
    uid = node.getAttribute && node.getAttribute(acgraph.WRAPPER_ID_PROP_NAME_) || null;
    if (goog.isDefAndNotNull(uid)) {
      break;
    }
    node = (node.parentNode);
  }
  var res = acgraph.wrappers_[uid || ""] || null;
  return res && res.domElement() == node ? res : null;
};
acgraph.StageType = {SVG:"svg", VML:"vml"};
acgraph.type_ = null;
if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9")) {
  acgraph.type_ = acgraph.StageType.VML;
} else {
  acgraph.type_ = acgraph.StageType.SVG;
}
acgraph.type = function() {
  return (acgraph.type_);
};
acgraph.renderer_ = acgraph.type_ == acgraph.StageType.VML ? acgraph.vector.vml.Renderer.getInstance() : acgraph.vector.svg.Renderer.getInstance();
acgraph.getRenderer = function() {
  return acgraph.renderer_;
};
acgraph.create = function(opt_container, opt_width, opt_height) {
  return acgraph.type_ == acgraph.StageType.VML ? new acgraph.vector.vml.Stage(opt_container, opt_width, opt_height) : new acgraph.vector.svg.Stage(opt_container, opt_width, opt_height);
};
acgraph.exportServer = "//export.anychart.com";
acgraph.server = function(opt_address) {
  if (goog.isDef(opt_address)) {
    acgraph.exportServer = opt_address;
  }
  return acgraph.exportServer;
};
acgraph.embedCss = function(css, opt_doc) {
  var styleElement = null;
  if (css) {
    styleElement = goog.dom.createDom(goog.dom.TagName.STYLE);
    styleElement.type = "text/css";
    if (styleElement.styleSheet) {
      styleElement["styleSheet"]["cssText"] = css;
    } else {
      goog.dom.appendChild(styleElement, goog.dom.createTextNode(css));
    }
    goog.dom.insertChildAt(goog.dom.getElementsByTagNameAndClass("head", undefined, opt_doc)[0], styleElement, 0);
  }
  return styleElement;
};
goog.global["acgraph"] = goog.global["acgraph"] || {};
goog.global["acgraph"]["fontSize"] = "10px";
goog.global["acgraph"]["fontColor"] = "#000";
goog.global["acgraph"]["textDirection"] = acgraph.vector.Text.Direction.LTR;
goog.global["acgraph"]["fontFamily"] = "Verdana";
acgraph.rect = function(opt_x, opt_y, opt_width, opt_height) {
  return new acgraph.vector.Rect(opt_x, opt_y, opt_width, opt_height);
};
acgraph.circle = function(opt_cx, opt_cy, opt_radius) {
  return new acgraph.vector.Circle(opt_cx, opt_cy, opt_radius);
};
acgraph.layer = function() {
  return new acgraph.vector.Layer;
};
acgraph.ellipse = function(opt_cx, opt_cy, opt_rx, opt_ry) {
  return new acgraph.vector.Ellipse(opt_cx, opt_cy, opt_rx, opt_ry);
};
acgraph.path = function() {
  return new acgraph.vector.Path;
};
acgraph.image = function(opt_src, opt_x, opt_y, opt_width, opt_height) {
  return new acgraph.vector.Image(opt_src, opt_x, opt_y, opt_width, opt_height);
};
acgraph.text = function(opt_x, opt_y, opt_text, opt_style) {
  var text = acgraph.type_ == acgraph.StageType.VML ? new acgraph.vector.vml.Text(opt_x, opt_y) : new acgraph.vector.Text(opt_x, opt_y);
  if (opt_style) {
    text.style(opt_style);
  }
  if (opt_text) {
    text.text(opt_text);
  }
  return text;
};
acgraph.hatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  return new acgraph.vector.HatchFill(opt_type, opt_color, opt_thickness, opt_size);
};
acgraph.patternFill = function(bounds) {
  return new acgraph.vector.PatternFill(bounds);
};
acgraph.clip = function(opt_leftOrShape, opt_top, opt_width, opt_height) {
  return acgraph.type_ == acgraph.StageType.VML ? new acgraph.vector.vml.Clip(null, opt_leftOrShape, opt_top, opt_width, opt_height) : new acgraph.vector.Clip(null, opt_leftOrShape, opt_top, opt_width, opt_height);
};
acgraph.unmanagedLayer = function(opt_content) {
  return new acgraph.vector.UnmanagedLayer(opt_content);
};
acgraph.useAbsoluteReferences = function(opt_value) {
  if (goog.isDef(opt_value)) {
    acgraph.compatibility.USE_ABSOLUTE_REFERENCES = opt_value;
  } else {
    return !!acgraph.getReference();
  }
};
acgraph.getReferenceValue_ = undefined;
acgraph.getReference = function() {
  if (goog.isDef(acgraph.getReferenceValue_)) {
    return acgraph.getReferenceValue_;
  }
  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher("9") && !goog.userAgent.isVersionOrHigher("10")) {
    return acgraph.getReferenceValue_ = "";
  }
  return acgraph.getReferenceValue_ = acgraph.compatibility.USE_ABSOLUTE_REFERENCES || goog.isNull(acgraph.compatibility.USE_ABSOLUTE_REFERENCES) && goog.dom.getElementsByTagNameAndClass("base").length ? window.location.origin + window.location.pathname + window.location.search : "";
};
acgraph.updateReferences = function() {
  var oldReference = acgraph.getReferenceValue_;
  acgraph.getReferenceValue_ = undefined;
  if (!goog.isDef(oldReference) || acgraph.getReference() == oldReference) {
    return;
  }
  var wrapper;
  var renderer = acgraph.getRenderer();
  for (var id in acgraph.wrappers_) {
    if (!acgraph.wrappers_.hasOwnProperty(id)) {
      continue;
    }
    wrapper = acgraph.wrappers_[id];
    var wrapperStage = wrapper.getStage();
    if (!wrapperStage) {
      continue;
    }
    if (wrapper instanceof acgraph.vector.Element) {
      if (wrapperStage.isSuspended()) {
        wrapper.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
      } else {
        if (!wrapper.hasDirtyState(acgraph.vector.Element.DirtyState.CLIP)) {
          renderer.setClip(wrapper);
        }
      }
    }
    if (wrapper instanceof acgraph.vector.Shape) {
      if (wrapperStage.isSuspended()) {
        wrapper.setDirtyState(acgraph.vector.Element.DirtyState.FILL | acgraph.vector.Element.DirtyState.STROKE);
      } else {
        if (!wrapper.hasDirtyState(acgraph.vector.Element.DirtyState.FILL)) {
          renderer.applyFill(wrapper);
        }
        if (!wrapper.hasDirtyState(acgraph.vector.Element.DirtyState.STROKE)) {
          renderer.applyStroke(wrapper);
        }
      }
    }
  }
};
goog.exportSymbol("acgraph.create", acgraph.create);
goog.exportSymbol("acgraph.type", acgraph.type);
goog.exportSymbol("acgraph.server", acgraph.server);
goog.exportSymbol("acgraph.StageType.SVG", acgraph.StageType.SVG);
goog.exportSymbol("acgraph.StageType.VML", acgraph.StageType.VML);
goog.exportSymbol("acgraph.rect", acgraph.rect);
goog.exportSymbol("acgraph.circle", acgraph.circle);
goog.exportSymbol("acgraph.ellipse", acgraph.ellipse);
goog.exportSymbol("acgraph.path", acgraph.path);
goog.exportSymbol("acgraph.text", acgraph.text);
goog.exportSymbol("acgraph.layer", acgraph.layer);
goog.exportSymbol("acgraph.image", acgraph.image);
goog.exportSymbol("acgraph.hatchFill", acgraph.hatchFill);
goog.exportSymbol("acgraph.patternFill", acgraph.patternFill);
goog.exportSymbol("acgraph.clip", acgraph.clip);
goog.exportSymbol("acgraph.useAbsoluteReferences", acgraph.useAbsoluteReferences);
goog.exportSymbol("acgraph.updateReferences", acgraph.updateReferences);

