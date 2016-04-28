goog.provide('acgraph.error');


/**
 * A namespace for error handling, error messages, and error codes functionality.
 * @namespace
 * @name acgraph.error
 */


//----------------------------------------------------------------------------------------------------------------------
//
//  Error Enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Error codes.
 * @enum {number}
 */
acgraph.error.Code = {
  /** Can't find an error message that corresponds to specified error code */
  ERROR_IS_NOT_FOUND: 0,

  /** Requested stage type not supported */
  STAGE_TYPE_NOT_SUPPORTED: 1,

  /** Container to render stage should be defined */
  CONTAINER_SHOULD_BE_DEFINED: 2,

  /** Stage should have dom element */
  STAGE_SHOULD_HAVE_DOM_ELEMENT: 3,

  /** Unable to set parent component */
  PARENT_UNABLE_TO_BE_SET: 4,

  /** Trying to perform operation with the disposed element */
  OPERATION_ON_DISPOSED: 5,

  /** Synchronous rendering didn't clean up all dirty states */
  DIRTY_AFTER_SYNC_RENDER: 6,

  /** Can't add an element constructed by another Stage */
  STAGE_MISMATCH: 7,

  /** Wrong arguments passed to swapChildren */
  WRONG_SWAPPING: 8,

  /** Path must start with moveTo command */
  EMPTY_PATH: 9,

  /** Method must be implemented */
  UNIMPLEMENTED_METHOD: 10,

  /** Missing required parameter */
  REQUIRED_PARAMETER_MISSING: 11,

  /** Parameter type mismatch */
  PARAMETER_TYPE_MISMATCH: 12,

  /** Required parameter is null or undefined */
  PARAMETER_IS_NULL_OR_UNDEFINED: 13,

  /** Invalid number of parameters */
  INVALID_NUMBER_OF_PARAMETERS: 14,

  /** Feature not supported in VML */
  FEATURE_NOT_SUPPORTED_IN_VML: 15
};


/**
 * A text message corresponding to an error code.
 * @enum {string}
 */
acgraph.error.Message = {
  /**
   * ERROR_IS_NOT_FOUND
   */
  0: 'Can\'t find an error message that corresponds to the specified error code',
  /**
   * STAGE_TYPE_NOT_SUPPORTED
   */
  1: 'Requested stage type is not supported',
  /**
   * CONTAINER_SHOULD_BE_DEFINED
   */
  2: 'Container should be defined to render stage',
  /**
   * STAGE_SHOULD_HAVE_DOM_ELEMENT
   */
  3: 'Stage should have a DOM element',
  /**
   * PARENT_UNABLE_TO_BE_SET
   */
  4: 'Unable to set the parent component',
  /**
   * OPERATION_ON_DISPOSED
   */
  5: 'Trying to perform an operation with the disposed element',
  /**
   * DIRTY_AFTER_SYNC_RENDER
   */
  6: 'Synchronous rendering didn\'t clean up all dirty states',
  /**
   * STAGE_MISMATCH
   */
  7: 'Can\'t add an element constructed by another Stage',
  /**
   * WRONG_SWAPPING
   */
  8: 'Wrong arguments passed to swapChildren',
  /**
   * EMPTY_PATH
   */
  9: 'Path must start with moveTo command',
  /**
   * UNIMPLEMENTED_METHOD
   */
  10: 'Method must be implemented',
  /**
   * REQUIRED_PARAMETER_MISSING
   */
  11: 'Missing required parameter',
  /**
   * PARAMETER_TYPE_MISMATCH
   */
  12: 'Parameter type mismatch',
  /**
   * PARAMETER_IS_NULL_OR_UNDEFINED
   */
  13: 'Required parameter is null or undefined',
  /**
   * INVALID_NUMBER_OF_PARAMETERS
   */
  14: 'Invalid number of parameters',
  /**
   * FEATURE_NOT_SUPPORTED_IN_VML
   */
  15: 'Sorry, this feature in not supported in VML oriented browsers'
};


/**
 * Associates custom message to an error code.
 * @param {!acgraph.error.Code} errorCode The error code.
 * @return {?string} .
 */
acgraph.error.getErrorMessage = function(errorCode) {
  return acgraph.error.Message[errorCode] || 'Unknown error happened';
};
