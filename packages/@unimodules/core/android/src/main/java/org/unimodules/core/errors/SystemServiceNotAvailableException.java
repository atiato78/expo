package org.unimodules.core.errors;

public class SystemServiceNotAvailableException extends CodedRuntimeException {

  public SystemServiceNotAvailableException(Class service) {
    super("System service " + service.getSimpleName() + " is not available on this device");
  }

  @Override
  public String getCode() {
    return "E_FUNCTIONALITY_NOT_AVAILABLE";
  }
}
