package org.unimodules.core.errors;

/**
 * Exception for mismatched host-to-native interfaces. Compared to a Java-only
 * program, these modules are more susceptible to mismatched interfaces, and
 * this class helps harden those interfaces.
 */

public class UnsupportedMethodException extends CodedRuntimeException {
  public UnsupportedMethodException(String message) {
    super(message);
  }

  public UnsupportedMethodException(Throwable cause) {
    super(cause);
  }

  public UnsupportedMethodException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public String getCode() {
    return "ERR_UNSUPPORTED_METHOD";
  }
}
