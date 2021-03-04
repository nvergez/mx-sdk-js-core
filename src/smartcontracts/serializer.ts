import { BinaryCodec } from "./codec";
import { Type, EndpointParameterDefinition, TypedValue } from "./typesystem";
import { CompositeType, CompositeValue } from "./typesystem/composite";
import { OptionalType, OptionalValue, VariadicType, VariadicValue } from "./typesystem/variadic";

export const ArgumentsSeparator = "@";

/**
 * For the moment, this is the only codec used.
 */
const Codec = new BinaryCodec();

export class Serializer {
    /**
     * Reads typed values from an arguments string (e.g. aa@bb@@cc), given parameter definitions.
     */
    stringToValues(joinedString: string, parameters: EndpointParameterDefinition[]): TypedValue[] {
        let buffers = this.stringToBuffers(joinedString);
        let values = this.buffersToValues(buffers, parameters);
        return values;
    }

    /**
     * Reads raw buffers from an arguments string (e.g. aa@bb@@cc).
     */
    stringToBuffers(joinedString: string): Buffer[] {
        return joinedString.split(ArgumentsSeparator).map(item => Buffer.from(item, "hex")).filter(item => item.length > 0);
    }

    /**
     * Decodes a set of buffers into a set of typed values, given parameter definitions.
     */
    buffersToValues(buffers: Buffer[], parameters: EndpointParameterDefinition[]): TypedValue[] {
        // TODO: Refactor, split (function is quite complex).

        buffers = buffers || [];
        
        let values: TypedValue[] = [];
        let bufferIndex = 0;
        let numBuffers = buffers.length;

        for (let i = 0; i < parameters.length; i++) {
            let parameter = parameters[i];
            let type = parameter.type;
            let value = readValue(type);
            values.push(value);
        }

        // This is a recursive function.
        function readValue(type: Type): TypedValue {
            // TODO: Use matchers.

            if (type instanceof OptionalType) {
                let typedValue = readValue(type.getFirstTypeParameter());
                return new OptionalValue(type, typedValue);
            } else if (type instanceof VariadicType) {
                let typedValues = [];

                while (!hasReachedTheEnd()) {
                    typedValues.push(readValue(type.getFirstTypeParameter()));
                }

                return new VariadicValue(type, typedValues);
            } else if (type instanceof CompositeType) {
                let typedValues = [];

                for (const typeParameter of type.getTypeParameters()) {
                    typedValues.push(readValue(typeParameter));
                }

                return new CompositeValue(type, typedValues);
            } else {
                // Non-composite (singular), non-variadic (fixed) type.
                // The only branching without a recursive call.
                let typedValue = decodeNextBuffer(type);
                return typedValue!;
            }
        }

        function decodeNextBuffer(type: Type): TypedValue | null {
            if (hasReachedTheEnd()) {
                return null;
            }

            let buffer = buffers[bufferIndex++];
            let decodedValue = Codec.decodeTopLevel(buffer, type);
            return decodedValue;
        }

        function hasReachedTheEnd() {
            return bufferIndex >= numBuffers;
        }

        return values;
    }

    /**
     * Serializes a set of typed values into an arguments string (e.g. aa@bb@@cc).
     */
    valuesToString(values: TypedValue[]): string {
        let strings = this.valuesToStrings(values);
        let joinedString = strings.join(ArgumentsSeparator);
        return joinedString;
    }

    /**
     * Serializes a set of typed values into a set of strings.
     */
    valuesToStrings(values: TypedValue[]): string[] {
        let buffers = this.valuesToBuffers(values);
        let strings = buffers.map(buffer => buffer.toString("hex"));
        return strings;
    }

    /**
     * Serializes a set of typed values into a set of strings buffers.
     * Variadic types and composite types might result into none, one or more buffers.
     */
    valuesToBuffers(values: TypedValue[]): Buffer[] {
        let buffers = [];

        // TODO: Fix naive serialization, handle variadic types and composite types!
        // Note for reviewers - this was not implemented by mistake. Will be added in this PR (along with some tests).
        for (const value of values) {
            let buffer = Codec.encodeTopLevel(value);
            buffers.push(buffer);
        }

        return buffers;
    }
}
