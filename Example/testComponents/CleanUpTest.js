import React from 'react';
import Animated, { useSharedValue, useEventWorklet } from 'react-native-reanimated';
import { View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const CleanUpTest = () => {
    
    const x = useSharedValue(0)
    const y = useSharedValue(0)
    const worklet = useEventWorklet(function(x, y) {
        'worklet'
        console.log(`worklet: ${this.event.translationX}`)
        x.set(this.event.translationX)
        y.set(this.event.translationY)
        if (this.event.state === 5) {
            this.notify()
        }
    }, [x.sharedValue, y.sharedValue])
    worklet.setListener(() => {
        console.log('from listener')
        x.set(0)
        y.set(0)
    })

    return (
        <View>
            <PanGestureHandler
                onHandlerStateChange={worklet}
                onGestureEvent={worklet}
            >
                <Animated.View
                    style={{
                        width: 100,
                        height: 100,
                        backgroundColor: 'green',
                        transform: [{
                            translateX: x
                        },
                        {
                            translateY: y
                        }]
                    }}
                />
            </PanGestureHandler>
        </View>
    )
}

export default CleanUpTest