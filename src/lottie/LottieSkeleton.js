import React, { Component } from "react";
import lottie from 'lottie-web';

import image1 from '../json/skeleton_start.json';
import image2 from '../json/skeleton_loop.json';

export default class LottieSkeleton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentAnimation: 'start' // 현재 애니메이션 상태 추가
        }
    }

    componentDidMount() {
        this.loadFirstAnimation();
    }

    loadFirstAnimation = () => {
        this.animation = lottie.loadAnimation({
            container: this.animBox,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: image1
        });
        this.animation.addEventListener('complete', this.handleAnimationComplete);
    }

    handleAnimationComplete = () => {
        // 첫 번째 애니메이션 완료 시
        if (this.state.currentAnimation === 'start') {
            // 이벤트 리스너 제거 및 애니메이션 정리
            this.animation.removeEventListener("complete", this.handleAnimationComplete);
            this.animation.destroy();
            
            // 두 번째 애니메이션 로드
            this.animation = lottie.loadAnimation({
                container: this.animBox,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: image2
            });
            
            // 상태 업데이트
            this.setState({ currentAnimation: 'loop' });
        }
    };

    componentWillUnmount() {
        // 컴포넌트 언마운트 시 애니메이션 정리
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
                    width: this.props.width || '100%', 
                    height: this.props.height || '100%', 
                    ...this.props.style 
                }}
            />
        )
    }
}