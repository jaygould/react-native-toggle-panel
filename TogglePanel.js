import React, { Component } from 'react';
import { Text, View, StyleSheet, Animated } from 'react-native';

class TogglePanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			collapsed: true,
			receivedHeight: false,
			height: new Animated.Value(0),
			opacity: new Animated.Value(0)
		};
		this._getInnerHeight = this._getInnerHeight.bind(this);
		this._ref = this._ref.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState(
			{
				collapsed: nextProps.collapsed
			},
			() => {
				if (this.props.isAnimated) {
					this._toggleAnimated();
				}
			}
		);
	}

	/*
	*	Non-animated functions
	*/

	_renderPanel(positionStyle, panelBg, panelPd) {
		if (!this.props.collapsed) {
			return (
				<View style={[positionStyle, panelBg, panelPd]}>
					{this.props.children}
				</View>
			);
		}
	}

	/*
	*	Animated functions
	*/

	innerConta = false;
	componentDidMount() {
		if (this.props.isAnimated) {
			setTimeout(this._getInnerHeight);
		}
	}

	_ref(ref) {
		innerConta = ref;
	}

	_getInnerHeight() {
		if (innerConta) {
			innerConta.getNode().measure((ox, oy, width, height, px, py) => {
				this.setState({
					contentHeight: height,
					receivedHeight: true
				});
			});
		}
	}

	_renderPanelAnimated(positionStyle, panelBg, panelPd) {
		let customStyle = null;
		if (this.state.receivedHeight) {
			customStyle = {
				height: this.state.height,
				opacity: this.state.opacity
			};
		}

		return (
			<Animated.View
				style={[positionStyle, panelBg, panelPd, customStyle]}
				ref={this._ref}
			>
				{this.props.children}
			</Animated.View>
		);
	}

	_toggleAnimated() {
		console.log('toggle amim', this.state);
		if (this.state.collapsed) {
			Animated.sequence([
				Animated.parallel([
					Animated.timing(this.state.opacity, {
						toValue: 0,
						duration: 200
					}),
					Animated.timing(this.state.height, {
						toValue: 0,
						delay: 200,
						duration: 200
					})
				])
			]).start();
		} else {
			Animated.sequence([
				Animated.parallel([
					Animated.timing(this.state.height, {
						toValue: this.state.contentHeight,
						duration: 300
					}),
					Animated.timing(this.state.opacity, {
						toValue: 1,
						delay: 200,
						duration: 300
					})
				])
			]).start();
		}
	}

	/*
	*	Render
	*/

	render() {
		const { position, isAnimated, panelBackground, panelPadding } = this.props;
		const absoluteStyle = StyleSheet.flatten(styles.panelAbsolute);
		const relativeStyle = StyleSheet.flatten(styles.panelRelative);

		const positionStyle =
			position == 'absolute' ? absoluteStyle : relativeStyle;

		panelBackground
			? (panelBg = { backgroundColor: panelBackground })
			: (panelBg = { backgroundColor: '#ffffff' });

		panelPadding
			? (panelPd = { padding: panelPadding })
			: (panelPd = { padding: 0 });

		let chosenView = null;
		if (this.props.isAnimated) {
			chosenView = this._renderPanelAnimated(positionStyle, panelBg, panelPd);
		} else {
			chosenView = this._renderPanel(positionStyle, panelBg, panelPd);
		}

		//stops the white flash caused by the height of child initially pushing
		//the wraper out. This is a bit of a hack so needs updating at some point
		if (this.props.isAnimated) {
			if (this.state.receivedHeight) {
				flashHack = {
					opacity: 1,
					position: 'relative'
				};
			} else {
				flashHack = {
					opacity: 0,
					position: 'absolute'
				};
			}
		} else {
			flashHack = null;
		}

		return <View style={[styles.panelWrap, flashHack]}>{chosenView}</View>;
	}
}

export default TogglePanel;

const styles = StyleSheet.create({
	panelWrap: {
		position: 'relative',
		zIndex: 100
	},
	panelRelative: {
		position: 'relative',
		zIndex: 1000,
		width: '100%',
		overflow: 'hidden'
	},
	panelAbsolute: {
		position: 'absolute',
		width: '100%',
		zIndex: 1000,
		overflow: 'hidden'
	}
});
