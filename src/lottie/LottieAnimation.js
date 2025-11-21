import React, { Component } from 'react';
import lottie from 'lottie-web';

export default class LottieAnimation extends Component {
    constructor(props) {
        super(props);
        this.lottieImgRef = React.createRef();
        this.state = {};
    }

    componentDidMount() {
        this.animation = lottie.loadAnimation({
            container: this.lottieImgRef.current,
            renderer: "svg",
            loop: typeof this.props.loop === 'number' ? this.props.loop : (this.props.loop === true || this.props.loop === false) ? this.props.loop : true,
            autoplay: this.props.autoPlay !== undefined ? this.props.autoPlay : true,
            animationData: this.props.animationData,
        });
    }

    componentWillUnmount() {
        if (this.animation) {
            this.animation.destroy();
        }
    }

    render() {
        return (
            <div className={this.props.className} style={{ width: this.props.width || '100%', height: this.props.height || '100%' }}>
                <div
                    ref={this.lottieImgRef}
                />
            </div>
        );
    }
}
