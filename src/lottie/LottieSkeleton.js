"use client";

import React, { Component } from "react";
import image1 from '../json/skeleton_start.json';
import image2 from '../json/skeleton_loop.json';

export default class LottieSkeleton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentAnimation: 'start'
        };
        this.animation = null;
        this.animBox = null;
    }

    async componentDidMount() {
        // SSR 방지: lottie-web은 클라이언트에서만 로드
        const lottie = (await import("lottie-web")).default;
        this.lottie = lottie;

        this.loadFirstAnimation();
    }

    loadFirstAnimation = () => {
        this.animation = this.lottie.loadAnimation({
            container: this.animBox,
            renderer: "svg",
            loop: false,
            autoplay: true,
            animationData: image1
        });

        this.animation.addEventListener("complete", this.handleAnimationComplete);
    };

    handleAnimationComplete = () => {
        if (this.state.currentAnimation === "start") {
            this.animation.removeEventListener(
                "complete",
                this.handleAnimationComplete
            );
            this.animation.destroy();

            this.animation = this.lottie.loadAnimation({
                container: this.animBox,
                renderer: "svg",
                loop: true,
                autoplay: true,
                animationData: image2
            });

            this.setState({ currentAnimation: "loop" });
        }
    };

    componentWillUnmount() {
        if (this.animation) {
            this.animation.destroy();
        }
    }

    render() {
        return (
            <div
                ref={(ref) => (this.animBox = ref)}
                className={this.props.className}
                style={{
                    width: this.props.width || "100%",
                    height: this.props.height || "100%",
                    ...this.props.style
                }}
            />
        );
    }
}
