

export var ErrTransactionNotSigned = new Error("transaction not signed");
export var ErrProviderNotSet = new Error("provider not set");
export var ErrAsyncTimerAlreadyRunning = new Error("async timer already running");
export var ErrInvalidFunctionName = new Error("invalid function name");
//export var ErrInvalidArgument = new Error("invalid argument");
export var ErrUserAccountNotSet = new Error("user account not set");
export var ErrSCAddressNotSet = new Error("smart contract address not set");
export var ErrGasPriceNotSet = new Error("gas price not set");
export var ErrGasLimitNotSet = new Error("gas limit not set");
export var ErrInvalidVMType = new Error("invalid vm type");
export var ErrInvalidSmartContractCode = new Error("invalid smart contract code");
export var ErrInvalidChainID = new Error("invalid chain ID");
export var ErrInvalidTransactionVersion = new Error("invalid transaction version");
export var ErrExpectedTransactionStatusNotReached = new Error("expected transaction status not reached");

export class Err extends Error {
    inner: Error | undefined = undefined;

    public constructor(message: string, inner?: Error) {
        super(message);
        this.inner = inner;
    }
}

export class ErrInvalidArgument extends Err {
    public constructor(name: string, value: any, inner?: Error) {
        super(`Invalid argument "${name}: ${value}"`, inner);
    }
}

export class ErrAddressCannotCreate extends Err {
    public constructor(input: any, inner?: Error) {
        let message = `Cannot create address from: ${input}`;
        super(message, inner);
    }
}

export class ErrAddressBadHrp extends Err {
    public constructor(expected: string, got: string) {
        super(`Wrong address HRP. Expected: ${expected}, got ${got}`);
    }
}

export class ErrAddressEmpty extends Err {
    public constructor() {
        super(`Address is empty`);
    }
}

export class ErrSignerCannotSign extends Err {
    public constructor(inner: Error) {
        super(`Cannot sign`, inner);
    }
}

export class ErrBalanceInvalid extends Err {
    public constructor(value: bigint) {
        super(`Invalid balance: ${value}`);
    }
}

export class ErrGasPriceInvalid extends Err {
    public constructor(value: number) {
        super(`Invalid gas price: ${value}`);
    }
}

export class ErrGasLimitInvalid extends Err {
    public constructor(value: number) {
        super(`Invalid gas limit: ${value}`);
    }
}

export class ErrNonceInvalid extends Err {
    public constructor(value: number) {
        super(`Invalid nonce: ${value}`);
    }
}
