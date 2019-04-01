package expo.modules.av

import kotlin.reflect.KParameter
import kotlin.reflect.full.declaredMemberProperties

inline fun <reified T : Any> merge(a: T, b: T): T {
  if (!T::class.isData) {
    throw IllegalArgumentException("You can merge data classes only!")
  }

  if (T::class.isAbstract) {
    throw IllegalArgumentException("You can merge data classes only!")
  }

  if (T::class.constructors.size != 1) {
    throw IllegalArgumentException(
        "Class must have exactly one constructor in  order to be merged correctly!")
  }

  val constructorParams = T::class.constructors.first().parameters
  var parameters: Map<KParameter, Any> = HashMap()
  val copyMethod = a::class.members.first { it.name == "copy" }

  for (field in T::class.declaredMemberProperties) {
    val value = field.get(b)
    if (value != null) {
      val parameter = constructorParams.findLast { it.name == field.name }!!
      parameters = parameters.plus((parameter to value))
    }
  }

  return if (!parameters.isEmpty()) {
    copyMethod.callBy(parameters.plus(copyMethod.parameters[0] to a)) as T
  } else {
    b
  }

}
