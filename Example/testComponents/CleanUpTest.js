import React from 'react';
import Animated, { useSharedValue, useWorklet, getRegisteredSharedValuesIds, getRegisteredWorkletsIds } from 'react-native-reanimated';
import { View, Text } from 'react-native';

const workletBody = function(a, b, c) {
    'worklet'
    this.log(`worklet called ${ a.value }/${ b.value }/${ c.value }`)
    c.set(a.value + b.value + c.value)
    const oldB = b.value
    b.set(a.value + b.value)
    a.set(oldB)
    return true
}
/*
const eventWorkletBody = function(a, b) {
    'worklet'
    if (this.event.state === 2) {
        a.set(this.event.translationX)
        b.set(this.event.translationY)
        return true
    }
}
*/

const Child = (props) => {

    let flag = false;
    const n = 5;
    let svs = []
    let worklets = []
    let eventWorklets = []

    const toBeTested = [
        'sharedValues',
        //'worklets',
        //'eventWorklets',
    ]

    ;(() => {
        if (flag) return
        flag = true
        if (toBeTested.includes('sharedValues')) {
            for (var i = 0; i < n; ++i) {
                svs.push(useSharedValue((props.id+1)*(i+1)))
            }
        }

        if (toBeTested.includes('worklets')) {
            const startingIndex = Math.min(i, n - 3)
            for (var i = 0; i < n; ++i) {
                worklets.push(useWorklet(workletBody, [
                    svs[startingIndex].sharedValue,
                    svs[startingIndex + 1].sharedValue,
                    svs[startingIndex + 2].sharedValue,
                ]));
            }
        }

        if (toBeTested.includes('eventWorklets')) {
            const eStartingIndex = Math.min(i, n - 2)
            eventWorklets.push(useEventWorklet(eventWorkletBody, [
                svs[eStartingIndex],
                svs[eStartingIndex + 1],
            ]))
        }

        for (let worklet of worklets) {
            worklet();
        }
        
    })();

    /*
    const generateHandlers = function(eventWorklet) {
        return (
            <PanGestureHandler
                onHandlerStateChange={eventWorklet}
                onGestureEvent={eventWorklet}
            >
                <Animated.View
                    style={{
                        width: 100,
                        height: 100,
                        backgroundColor: 'blue',
                        margin: 5,
                    }}
                />
            </PanGestureHandler>
        )
    }
    */
    return (
        <View>
            <Text>{ props.id }</Text>
        </View>
    )
}

const cleanupPhase = {
    'rendering': 1,
    'hidding': 2,
    'checking': 3,
    'checked': 4,
}

class CleanUpTest extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            cr: 0,
            cleanupPhase: cleanupPhase.rendering,
        }
        this.n = 5

        this.initialState = {
            obtained: false,
            workletIds: [],
            svIds: [],
        }
        this.finalState = {
            obtained: false,
            workletIds: [],
            svIds: [],
        }
    }

    componentDidMount() {
        (async () => {
            await this.getInitialState()

            this.interval = setInterval(() => {
                console.log(`change children ${this.state.cr}`)
                this.setState({ cr: this.state.cr + 1 })
                if (this.state.cr >= this.n) {
                    console.log('clear interval')
                    clearInterval(this.interval)
                    this.setState({ cleanupPhase: cleanupPhase.hidding })
                }
            }, 700)
        })()
    }

    getInitialState = async () => {
        if (this.initialState.obtained) {
            return
        }
        this.initialState.obtained = true
        try {
            let ids = await getRegisteredSharedValuesIds();
            this.initialState.svIds = ids.split(' ')

            ids = await getRegisteredWorkletsIds();
            this.initialState.workletIds = ids.split(' ')

            console.log(`initial state: ${ JSON.stringify(this.initialState) }`)
        } catch(e) {
            console.log(`get initial state rejected: ${e}`)
        }
    }

    getFinalState = async () => {
        if (this.finalState.obtained) {
            return
        }
        this.finalState.obtained = true
        try {
            let ids = await getRegisteredSharedValuesIds();
            this.finalState.svIds = ids.split(' ')

            ids = await getRegisteredWorkletsIds();
            this.finalState.workletIds = ids.split(' ')
        } catch(e) {
            console.log(`get final state rejected: ${e}`)
        }
        
    }

    checkCleanup = async () => {
        if (this.state.cleanupPhase !== cleanupPhase.checking) {
            return
        }
        await this.getFinalState()
        if (JSON.stringify(this.initialState) === JSON.stringify(this.finalState)) {
            console.log('cleanup successful')
            return
        }
        console.warn('cleanup failed')
        console.log(JSON.stringify(this.initialState))
        console.log(JSON.stringify(this.finalState))
        this.setState({ cleanupPhase: cleanupPhase.checked })
    }

    renderChildren = (num) => {
        if (!this.initialState.obtained || this.state.cleanupPhase !== cleanupPhase.rendering) {
            return <></>;
        }
        const children = []
        for (var i = 0; i < this.n; ++i) {
            const id = num * this.n + i
            children.push(<Child id={ id } key={ id }/>)
        }
        return children.map(item => item)
    }

    componentDidUpdate() {
        if (this.state.cleanupPhase === cleanupPhase.hidding) {
            this.setState({ cleanupPhase: cleanupPhase.checking })
        }
    }

    render() {
        if (this.state.cleanupPhase === cleanupPhase.checking) {
            this.checkCleanup()
        }
        return (
            <View>
                { (this.state.cleanupPhase !== cleanupPhase.rendering) ? <Text>clear</Text> : this.renderChildren(this.state.cr) }
            </View>
        )
    }
}

export default CleanUpTest