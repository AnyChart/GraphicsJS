#!/usr/bin/env python
# coding=utf-8

import os
import sys
import subprocess
import urllib
import zipfile
import platform
import shlex
import time

# =======================================================================================================================
#           Project paths
# =======================================================================================================================
COMPILER_VERSION = '20161024'
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
CONTRIB_PATH = os.path.join(PROJECT_PATH, 'contrib')
COMPILER_PATH = os.path.join(CONTRIB_PATH, 'compiler', 'closure-compiler-v%s.jar' % COMPILER_VERSION)
SRC_PATH = os.path.join(PROJECT_PATH, 'src')
OUT_PATH = os.path.join(PROJECT_PATH, 'out')
CLOSURE_LIBRARY_PATH = os.path.join(CONTRIB_PATH, 'closure-library')
CLOSURE_SOURCE_PATH = os.path.join(CLOSURE_LIBRARY_PATH, 'closure', 'goog')
CLOSURE_LINTER_WRAPPER_PATH = os.path.join(CONTRIB_PATH, 'closure-linter-wrapper')
CLOSURE_BIN_PATH = os.path.join(CLOSURE_LIBRARY_PATH, 'closure', 'bin')
DEPS_WRITER_PATH = os.path.join(CLOSURE_BIN_PATH, 'build', 'depswriter.py')

PYTHON = 'python'


# =======================================================================================================================
#                            Synchronize contributions.
# =======================================================================================================================
def __has_closure_library():
    return os.path.exists(CLOSURE_LIBRARY_PATH)


def __has_closure_compiler():
    return os.path.exists(COMPILER_PATH)


def __has_closure_linter_wrapper():
    return os.path.exists(CLOSURE_LINTER_WRAPPER_PATH)


def __has_closure_linter():
    has_lint = True
    try:
        subprocess.Popen(['gjslint'], shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except StandardError:
        has_lint = False

    return has_lint


def __ensure_dir_exists(path):
    if not os.path.exists(path):
        os.mkdir(path)


def __need_sync_contrib():
    return not __has_closure_library() \
           or not __has_closure_compiler() \
           or not __has_closure_linter_wrapper() \
           or not __has_closure_linter()


def __sync_contrib():
    t = time.time()
    __ensure_dir_exists(CONTRIB_PATH)

    subprocess.call(['git', 'submodule', 'init'])
    subprocess.call(['git', 'submodule', 'update'])

    # Download closure compiler
    if not os.path.exists(COMPILER_PATH):
        print 'Downloading Google Closure Compiler v.' + COMPILER_VERSION
        try:
            __download_and_unzip_from_http(
                "http://dl.google.com/closure-compiler/compiler-%s.zip" % COMPILER_VERSION,
                'compiler'
            )
        except StandardError as e:
            print e
            print 'Failed'
            return False

    # Install closure linter
    if not __has_closure_linter():
        if not __install_closure_linter():
            return False

    print 'Environment ready. Time spent: {:.3f}s\n'.format(time.time() - t)
    return True


def __download_and_unzip_from_http(from_url, dir_name):
    z_obj_path = os.path.join(CONTRIB_PATH, dir_name + '.zip')

    # download zip archive from url
    if not os.path.exists(z_obj_path):
        urllib.urlretrieve(
            from_url,
            z_obj_path
        )

    # extract zip archive
    target_path = os.path.join(CONTRIB_PATH, dir_name)
    __ensure_dir_exists(target_path)
    z_obj = zipfile.ZipFile(z_obj_path)
    z_obj.extractall(path=target_path)
    z_obj.close()

    # remove archive file
    os.remove(z_obj_path)
    return True


def __install_closure_linter():
    print 'Installing Google Closure Linter v.2.3.9'
    commands = [] if platform.system() == 'Windows' else ['sudo']
    commands.append('easy_install')
    commands.append('https://closure-linter.googlecode.com/files/closure_linter-2.3.9.tar.gz')
    try:
        subprocess.call(commands)
    except StandardError:
        print 'Failed: you should install easy_install module for python first'
        return False
    print 'Success'
    return True


def sync_required(func):
    def wrapper():
        if __need_sync_contrib():
            __sync_contrib()
        return func()

    return wrapper


# =======================================================================================================================
#           Build project
# =======================================================================================================================
def __getNotOptimizedCompilerArgs():
    compilerArgs = [
        '--compilation_level WHITESPACE_ONLY',
        '--formatting PRETTY_PRINT'
    ]
    return compilerArgs


def __getOptimizedCompilerArgs():
    compilerArgs = [
        '--charset UTF-8',
        '--compilation_level ADVANCED_OPTIMIZATIONS',
        '--process_closure_primitives',
        '--language_in ECMASCRIPT3',
        '--language_out ECMASCRIPT3',
        '--assume_function_wrapper',
        '--use_types_for_optimization true',
        '--output_wrapper "(function(){%output%})();"',
        '--env BROWSER',
        '--extra_annotation_name "includeDoc"',
        '--extra_annotation_name "illustration"',
        '--extra_annotation_name "illustrationDesc"',
        '--extra_annotation_name "ignoreDoc"',
        '--extra_annotation_name "propertyDoc"',
        '--extra_annotation_name "shortDescription"',
        '--warning_level VERBOSE',
        '--hide_warnings_for "libs/closure-library"',
        '--jscomp_warning accessControls',
        '--jscomp_warning ambiguousFunctionDecl',
        '--jscomp_warning checkDebuggerStatement',
        '--jscomp_warning checkEventfulObjectDisposal',
        '--jscomp_warning checkRegExp',
        '--jscomp_warning checkTypes',
        '--jscomp_warning checkVars',
        '--jscomp_warning closureDepMethodUsageChecks',
        '--jscomp_warning commonJsModuleLoad',
        '--jscomp_warning conformanceViolations',
        '--jscomp_warning const',
        '--jscomp_warning constantProperty',
        '--jscomp_warning deprecated',
        '--jscomp_warning deprecatedAnnotations',
        '--jscomp_warning duplicate',
        '--jscomp_warning duplicateMessage',
        '--jscomp_warning es3',
        '--jscomp_warning es5Strict',
        '--jscomp_warning externsValidation',
        '--jscomp_off extraRequire',
        '--jscomp_warning fileoverviewTags',
        '--jscomp_warning functionParams',
        '--jscomp_warning globalThis',
        '--jscomp_warning inferredConstCheck',
        '--jscomp_warning internetExplorerChecks',
        '--jscomp_warning invalidCasts',
        '--jscomp_warning misplacedTypeAnnotation',
        '--jscomp_warning missingGetCssName',
        '--jscomp_off missingOverride',
        '--jscomp_warning missingPolyfill',
        '--jscomp_warning missingProperties',
        '--jscomp_warning missingProvide',
        '--jscomp_warning missingRequire',
        '--jscomp_warning missingReturn',
        '--jscomp_warning msgDescriptions',
        '--jscomp_off newCheckTypes',
        '--jscomp_off newCheckTypesExtraChecks',
        '--jscomp_off nonStandardJsDocs',
        '--jscomp_off reportUnknownTypes',
        '--jscomp_warning suspiciousCode',
        '--jscomp_warning strictModuleDepCheck',
        '--jscomp_warning typeInvalidation',
        '--jscomp_warning undefinedNames',
        '--jscomp_warning undefinedVars',
        '--jscomp_warning unknownDefines',
        '--jscomp_off unusedLocalVariables',
        '--jscomp_off unusedPrivateMembers',
        '--jscomp_warning uselessCode',
        '--jscomp_off useOfGoogBase',
        '--jscomp_warning underscore',
        '--jscomp_warning visibility',
        '--jscomp_warning lintChecks',
    ]
    return compilerArgs


def __getDefaultCompilerArgs(outputFile):
    result = [
        'java -jar',
        COMPILER_PATH,
        '--js="%s"' % os.path.join(SRC_PATH, '**.js'),
        '--js="%s"' % os.path.join(CLOSURE_LIBRARY_PATH, '**.js'),
        '--define "goog.DEBUG=false"',
        '--js_output_file ' + outputFile,
        '--dependency_mode=STRICT',
        '--entry_point acgraphentry',
        '--hide_warnings_for="goog"'
    ]
    return result


@sync_required
def __compileBinary():
    __ensure_dir_exists(OUT_PATH)

    t = time.time()
    outputFileName = os.path.join(OUT_PATH, 'graphics.min.js')
    print 'Building optimized Graphics library js to ' + outputFileName
    commands = __getDefaultCompilerArgs(outputFileName) + \
               __getOptimizedCompilerArgs()
    success = (__call_compiler(commands) == 0)
    res = 'Success' if success else 'Failed'
    print res + ". Time spent: {:.3f}s\n".format(time.time() - t)

    return success


@sync_required
def __compilePlain():
    __ensure_dir_exists(OUT_PATH)

    t = time.time()
    outputFileName = os.path.join(OUT_PATH, 'graphics.js')
    print 'Building plain Graphics library js to ' + outputFileName
    commands = __getDefaultCompilerArgs(outputFileName) + \
               __getNotOptimizedCompilerArgs()
    success = (__call_compiler(commands) == 0)
    res = 'Success' if success else 'Failed'
    print res + ". Time spent: {:.3f}s\n".format(time.time() - t)

    return success


def __call_compiler(commands):
    commands = " ".join(commands).replace('\\', '\\\\')
    commands = shlex.split(commands)
    # print commands
    p = subprocess.Popen(commands, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (output, err) = p.communicate()
    retcode = p.poll()
    if len(output) > 0:
        print output
    return retcode


# =======================================================================================================================
#           Build deps
# =======================================================================================================================
@sync_required
def __buildDepsFromCommandLine():
    t = time.time()
    output_file = os.path.join(SRC_PATH, 'deps.js')
    success = (__callDepsWriter(SRC_PATH, output_file, 'whole project') == 0)
    res = 'Success' if success else 'Failed'
    print res + ". Time spent: {:.3f}s\n".format(time.time() - t)
    return success


def __callDepsWriter(root, output_file, bundle_name):
    print 'Writing deps file to ' + output_file
    return subprocess.call([
        PYTHON,
        DEPS_WRITER_PATH,
        '--root_with_prefix=' + root + ' ' + os.path.relpath(root, CLOSURE_SOURCE_PATH),
        '--output_file=' + output_file
    ])


# =======================================================================================================================
#                            Linter.
# =======================================================================================================================
@sync_required
def __lintFromCommandLine():
    t = time.time()
    success = (__callLinter(SRC_PATH) == 0)
    res = 'Success' if success else 'Failed'
    print res + ". Time spent: {:.3f}s\n".format(time.time() - t)
    return success


def __callLinter(root):
    print 'Linting ' + root + ' directory'
    return subprocess.call([
        PYTHON,
        os.path.join(CLOSURE_LINTER_WRAPPER_PATH, 'gjslint.py'),
        '--flagfile',
        'gjslint.cfg',
        '-r',
        root
    ])


# =======================================================================================================================
#                            JSDoc auto fix.
# =======================================================================================================================
@sync_required
def __autofixFromCommandLine():
    t = time.time()
    success = (__callAutoFix(SRC_PATH) == 0)
    res = 'Success' if success else 'Failed'
    print res + ". Time spent: {:.3f}s\n".format(time.time() - t)
    return res


def __callAutoFix(root):
    print 'Trying to fix ' + root + ' directory'
    return subprocess.call([
        PYTHON,
        os.path.join(CLOSURE_LINTER_WRAPPER_PATH, 'fixjsstyle.py'),
        '--flagfile',
        'gjslint.cfg',
        '-r',
        root
    ])


# =======================================================================================================================
#                            Help
# =======================================================================================================================
def __printHelp():
    print "Build script commands:\n" \
          "\n" \
          "without params   Prepares the environment, than lints and builds everything.\n" \
          "\n" \
          "contrib          Prepares buildin environment.\n" \
          "\n" \
          "deps             Build ./src/deps.js file, needed to run the library in uncompiled mode.\n" \
          "\n" \
          "compile          Builds the library minified js to ./out/ directory.\n" \
          "\n" \
          "plain            Builds the library as one file pretty-printed js to ./out/ directory.\n" \
          "\n" \
          "lint             Lints library sources.\n" \
          "\n" \
          "autofix          Tries to fix lint errors in library sources.\n"


# =======================================================================================================================
#                            Main
# =======================================================================================================================
def __execMainScript():
    print ''
    args = sys.argv
    if len(args) == 1:
        success = __sync_contrib() and \
                  __lintFromCommandLine() and \
                  __buildDepsFromCommandLine() and \
                  __compilePlain() and \
                  __compileBinary()
    elif args[1] == 'contrib':
        success = __sync_contrib()
    elif args[1] == 'compile':
        success = __compileBinary()
    elif args[1] == 'plain':
        success = __compilePlain()
    elif args[1] == 'deps':
        success = __buildDepsFromCommandLine()
    elif args[1] == 'lint':
        success = __lintFromCommandLine()
    elif args[1] == 'autofix':
        success = __autofixFromCommandLine()
    else:
        __printHelp()
        success = True
    return success


if __name__ == '__main__':
    try:
        success = __execMainScript()
    except StandardError as e:
        print e
        success = False
    sys.exit(0 if success else 1)
