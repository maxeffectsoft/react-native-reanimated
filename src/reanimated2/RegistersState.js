import NativeModule from './NativeReanimated';


// option:
//  1 - shared values
//  2 - worklets
async function getRegistersState(option) {
    if (!([1, 2].includes(option))) {
        console.warn(`invalid register state option provided: ${ option }`)
        return
    }

    return new Promise(function(resolve, reject) {
        NativeModule.getRegistersState(option, (value) => {
            // without setTimeout with timout 0 VM executes resolve before registering the Promise
            setTimeout(() => {
                if (value.substring(0, 5) === 'error') {
                    reject(value)
                }
                resolve(value);
            }, 0)
        });
    });
}

export async function getRegisteredSharedValuesIds() {
    return getRegistersState(1)
}

export async function getRegisteredWorkletsIds() {
    return getRegistersState(2)
}