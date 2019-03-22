import React from 'react';
import { View } from 'react-native';
const PI_2 = Math.PI / 2;
function radToDeg(radians) {
    return (radians * 180.0) / Math.PI;
}
export default class NativeLinearGradient extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            width: undefined,
            height: undefined,
        };
        this.onLayout = event => {
            this.setState({
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height,
            });
            if (this.props.onLayout) {
                this.props.onLayout(event);
            }
        };
<<<<<<< HEAD
    }
    getAngle() {
        const startPoint = this.props.startPoint ? this.props.startPoint : [0.5, 0.0];
        const endPoint = this.props.endPoint ? this.props.endPoint : [0.5, 1.0];
        const { width = 0, height = 0 } = this.state;
        let angle = 0;
        const gradientWidth = height * (endPoint[0] - startPoint[0]);
        const gradientHeight = width * (endPoint[1] - startPoint[1]);
        angle = Math.atan2(gradientHeight, gradientWidth) + Math.PI / 2;
        return `${angle}rad`;
    }
    getColors() {
        const { colors } = this.props;
        return colors
            .map((color, index) => {
            const location = this.props.locations && this.props.locations[index];
            if (location) {
                return `${color} ${location * 100}%`;
||||||| merged common ancestors
    }
    getAngle() {
        const startPoint = this.props.startPoint ? this.props.startPoint : [0.5, 0.0];
        const endPoint = this.props.endPoint ? this.props.endPoint : [0.5, 1.0];
        const { width = 0, height = 0 } = this.state;
        let angle = 0;
        const gradientWidth = height * (endPoint[0] - startPoint[0]);
        const gradientHeight = width * (endPoint[1] - startPoint[1]);
        angle = Math.atan2(gradientHeight, gradientWidth) + Math.PI / 2;
        return `${angle}rad`;
    }
    getColors() {
        const { colors } = this.props;
        return colors
            .map((color, index) => {
            const colorStr = `${color.toString(16)}`;
            const hex = `#${colorStr.substring(2, colorStr.length)}`;
            const location = this.props.locations && this.props.locations[index];
            if (location) {
                return `${hex} ${location * 100}%`;
=======
        this.getControlPoints = () => {
            const { startPoint, endPoint } = this.props;
            let correctedStartPoint = [0.5, 0.0];
            if (Array.isArray(startPoint)) {
                correctedStartPoint = [
                    startPoint[0] != null ? startPoint[0] : 0.5,
                    startPoint[1] != null ? startPoint[1] : 0.0,
                ];
>>>>>>> master
            }
<<<<<<< HEAD
            return color;
        })
            .join(',');
    }
    getBackgroundImage() {
        if (this.state.width && this.state.height) {
            return `linear-gradient(${this.getAngle()},${this.getColors()})`;
        }
        else {
            return 'transparent';
        }
||||||| merged common ancestors
            return hex;
        })
            .join(',');
    }
    getBackgroundImage() {
        if (this.state.width && this.state.height) {
            return `linear-gradient(${this.getAngle()},${this.getColors()})`;
        }
        else {
            return 'transparent';
        }
=======
            let correctedEndPoint = [0.5, 1.0];
            if (Array.isArray(endPoint)) {
                correctedEndPoint = [
                    endPoint[0] != null ? endPoint[0] : 0.5,
                    endPoint[1] != null ? endPoint[1] : 1.0,
                ];
            }
            return [correctedStartPoint, correctedEndPoint];
        };
        this.calculateGradientAngleFromControlPoints = () => {
            const [start, end] = this.getControlPoints();
            const { width = 0, height = 0 } = this.state;
            const radians = Math.atan2(height * (end[0] - start[0]), width * (end[1] - start[1])) + PI_2;
            const degrees = radToDeg(radians);
            return degrees;
        };
        this.getWebGradientColorStyle = () => {
            return this.getGradientValues().join(',');
        };
        this.convertJSColorToGradientSafeColor = (color, index) => {
            const { locations } = this.props;
            const hexColor = hexStringFromProcessedColor(color);
            let output = hexColor;
            if (locations && locations[index]) {
                const location = Math.max(0, Math.min(1, locations[index]));
                // Convert 0...1 to 0...100
                const percentage = location * 100;
                output += ` ${percentage}%`;
            }
            return output;
        };
        this.getGradientValues = () => {
            return this.props.colors.map(this.convertJSColorToGradientSafeColor);
        };
        this.getBackgroundImage = () => {
            if (this.state.width && this.state.height) {
                return `linear-gradient(${this.calculateGradientAngleFromControlPoints()}deg, ${this.getWebGradientColorStyle()})`;
            }
            return null;
        };
>>>>>>> master
    }
    render() {
        const { colors, locations, startPoint, endPoint, onLayout, style, ...props } = this.props;
        const backgroundImage = this.getBackgroundImage();
        // TODO: Bacon: In the future we could consider adding `backgroundRepeat: "no-repeat"`. For more browser support.
        return (<View style={[
            style,
            backgroundImage != null && {
                // @ts-ignore: [ts] Property 'backgroundImage' does not exist on type 'ViewStyle'.
                backgroundImage,
            },
        ]} onLayout={this.onLayout} {...props}/>);
    }
}
function hexStringFromProcessedColor(argbColor) {
    const hexColorString = argbColor.toString(16);
    const withoutAlpha = hexColorString.substring(2);
    const alpha = hexColorString.substring(0, 2);
    return `#${withoutAlpha}${alpha}`;
}
//# sourceMappingURL=NativeLinearGradient.web.js.map