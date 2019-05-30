import bindAll from 'lodash.bindall';
import debounce from 'lodash.debounce';
import defaultsDeep from 'lodash.defaultsdeep';
import makeToolboxXML from '../lib/make-toolbox-xml';
import PropTypes from 'prop-types';
import React from 'react';
import VMScratchBlocks from '../lib/blocks';
import VM from 'scratch-vm';

import analytics from '../lib/analytics';
import Prompt from './prompt.jsx';
import BlocksComponent from '../components/blocks/blocks.jsx';
import ExtensionLibrary from './extension-library.jsx';
import CustomProcedures from './custom-procedures.jsx';

import {connect} from 'react-redux';
import {updateToolbox} from '../reducers/toolbox';
import {activateColorPicker} from '../reducers/color-picker';
import {closeExtensionLibrary} from '../reducers/modals';
import {activateCustomProcedures, deactivateCustomProcedures} from '../reducers/custom-procedures';

const addFunctionListener = (object, property, callback) => {
    const oldFn = object[property];
    object[property] = function () {
        const result = oldFn.apply(this, arguments);
        callback.apply(this, result);
        return result;
    };
};

class Blocks extends React.Component {
    constructor (props) {
        super(props);
        this.ScratchBlocks = VMScratchBlocks(props.vm);
        bindAll(this, [
            'attachVM',
            'detachVM',
            'handleCategorySelected',
            'handlePromptStart',
            'handlePromptCallback',
            'handlePromptClose',
            'handleCustomProceduresClose',
            'onScriptGlowOn',
            'onScriptGlowOff',
            'onBlockGlowOn',
            'onBlockGlowOff',
            'handleExtensionAdded',
            'handleBlocksInfoUpdate',
            'onTargetsUpdate',
            'onVisualReport',
            'onWorkspaceUpdate',
            'onWorkspaceMetricsChange',
            'setBlocks'
        ]);
        this.ScratchBlocks.prompt = this.handlePromptStart;
        this.state = {
            workspaceMetrics: {},
            prompt: null
        };
        this.onTargetsUpdate = debounce(this.onTargetsUpdate, 100);
    }
    componentDidMount () {
        this.ScratchBlocks.FieldColourSlider.activateEyedropper_ = this.props.onActivateColorPicker;
        this.ScratchBlocks.Procedures.externalProcedureDefCallback = this.props.onActivateCustomProcedures;

        const workspaceConfig = defaultsDeep({},
            Blocks.defaultOptions,
            this.props.options,
            {toolbox: this.props.toolboxXML}
        );
        this.workspace = this.ScratchBlocks.inject(this.blocks, workspaceConfig);

        // @todo change this when blockly supports UI events
        addFunctionListener(this.workspace, 'translate', this.onWorkspaceMetricsChange);
        addFunctionListener(this.workspace, 'zoom', this.onWorkspaceMetricsChange);

        this.attachVM();
        this.props.vm.setLocale(this.props.locale, this.props.messages);

        analytics.pageview('/editors/blocks');
    }
    shouldComponentUpdate (nextProps, nextState) {
        return (
            this.state.prompt !== nextState.prompt ||
            this.props.isVisible !== nextProps.isVisible ||
            this.props.toolboxXML !== nextProps.toolboxXML ||
            this.props.extensionLibraryVisible !== nextProps.extensionLibraryVisible ||
            this.props.customProceduresVisible !== nextProps.customProceduresVisible ||
            this.props.locale !== nextProps.locale
        );
    }
    componentDidUpdate (prevProps) {
        if (prevProps.locale !== this.props.locale) {
            this.props.vm.setLocale(this.props.locale, this.props.messages);
        }

        if (prevProps.toolboxXML !== this.props.toolboxXML) {
            const selectedCategoryName = this.workspace.toolbox_.getSelectedItem().name_;
            this.workspace.updateToolbox(this.props.toolboxXML);
            this.workspace.toolbox_.setSelectedCategoryByName(selectedCategoryName);
        }
        if (this.props.isVisible === prevProps.isVisible) {
            return;
        }
        // @todo hack to resize blockly manually in case resize happened while hidden
        // @todo hack to reload the workspace due to gui bug #413
        if (this.props.isVisible) { // Scripts tab
            this.workspace.setVisible(true);
            this.props.vm.refreshWorkspace();
            window.dispatchEvent(new Event('resize'));
        } else {
            this.workspace.setVisible(false);
        }
    }
    componentWillUnmount () {
        this.detachVM();
        this.workspace.dispose();
    }
    attachVM () {
        this.workspace.addChangeListener(this.props.vm.blockListener);
        this.flyoutWorkspace = this.workspace
            .getFlyout()
            .getWorkspace();
        this.flyoutWorkspace.addChangeListener(this.props.vm.flyoutBlockListener);
        this.flyoutWorkspace.addChangeListener(this.props.vm.monitorBlockListener);
        this.props.vm.addListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
        this.props.vm.addListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
        this.props.vm.addListener('BLOCK_GLOW_ON', this.onBlockGlowOn);
        this.props.vm.addListener('BLOCK_GLOW_OFF', this.onBlockGlowOff);
        this.props.vm.addListener('VISUAL_REPORT', this.onVisualReport);
        this.props.vm.addListener('workspaceUpdate', this.onWorkspaceUpdate);
        this.props.vm.addListener('targetsUpdate', this.onTargetsUpdate);
        this.props.vm.addListener('EXTENSION_ADDED', this.handleExtensionAdded);
        this.props.vm.addListener('BLOCKSINFO_UPDATE', this.handleBlocksInfoUpdate);
    }
    detachVM () {
        this.props.vm.removeListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
        this.props.vm.removeListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
        this.props.vm.removeListener('BLOCK_GLOW_ON', this.onBlockGlowOn);
        this.props.vm.removeListener('BLOCK_GLOW_OFF', this.onBlockGlowOff);
        this.props.vm.removeListener('VISUAL_REPORT', this.onVisualReport);
        this.props.vm.removeListener('workspaceUpdate', this.onWorkspaceUpdate);
        this.props.vm.removeListener('targetsUpdate', this.onTargetsUpdate);
        this.props.vm.removeListener('EXTENSION_ADDED', this.handleExtensionAdded);
        this.props.vm.removeListener('BLOCKSINFO_UPDATE', this.handleBlocksInfoUpdate);
    }
    updateToolboxBlockValue (id, value) {
        const block = this.workspace
            .getFlyout()
            .getWorkspace()
            .getBlockById(id);
        if (block) {
            block.inputList[0].fieldRow[0].setValue(value);
        }
    }
    onTargetsUpdate () {
        if (this.props.vm.editingTarget) {
            ['glide', 'move', 'set'].forEach(prefix => {
                this.updateToolboxBlockValue(`${prefix}x`, Math.round(this.props.vm.editingTarget.x).toString());
                this.updateToolboxBlockValue(`${prefix}y`, Math.round(this.props.vm.editingTarget.y).toString());
            });
        }
    }
    onWorkspaceMetricsChange () {
        const target = this.props.vm.editingTarget;
        if (target && target.id) {
            const workspaceMetrics = Object.assign({}, this.state.workspaceMetrics, {
                [target.id]: {
                    scrollX: this.workspace.scrollX,
                    scrollY: this.workspace.scrollY,
                    scale: this.workspace.scale
                }
            });
            this.setState({workspaceMetrics});
        }
    }
    onScriptGlowOn (data) {
        this.workspace.glowStack(data.id, true);
    }
    onScriptGlowOff (data) {
        this.workspace.glowStack(data.id, false);
    }
    onBlockGlowOn (data) {
        this.workspace.glowBlock(data.id, true);
    }
    onBlockGlowOff (data) {
        this.workspace.glowBlock(data.id, false);
    }
    onVisualReport (data) {
        this.workspace.reportValue(data.id, data.value);
    }
    onWorkspaceUpdate (data) {
        // When we change sprites, update the toolbox to have the new sprite's blocks
        if (this.props.vm.editingTarget) {
            const target = this.props.vm.editingTarget;
            const dynamicBlocksXML = this.props.vm.runtime.getBlocksXML();
            const toolboxXML = makeToolboxXML(target.isStage, target.id, dynamicBlocksXML);
            this.props.updateToolboxState(toolboxXML);
        }

        if (this.props.vm.editingTarget && !this.state.workspaceMetrics[this.props.vm.editingTarget.id]) {
            this.onWorkspaceMetricsChange();
        }

        // Remove and reattach the workspace listener (but allow flyout events)
        this.workspace.removeChangeListener(this.props.vm.blockListener);
        const dom = this.ScratchBlocks.Xml.textToDom(data.xml);
        // @todo This line rerenders toolbox, and the change in the toolbox XML also rerenders the toolbox.
        // We should only rerender the toolbox once. See https://github.com/LLK/scratch-gui/issues/901
        this.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(dom, this.workspace);
        this.workspace.addChangeListener(this.props.vm.blockListener);

        if (this.props.vm.editingTarget && this.state.workspaceMetrics[this.props.vm.editingTarget.id]) {
            const {scrollX, scrollY, scale} = this.state.workspaceMetrics[this.props.vm.editingTarget.id];
            this.workspace.scrollX = scrollX;
            this.workspace.scrollY = scrollY;
            this.workspace.scale = scale;
            this.workspace.resize();
        }
    }
    handleExtensionAdded (blocksInfo) {
        this.ScratchBlocks.defineBlocksWithJsonArray(blocksInfo.map(blockInfo => blockInfo.json));
        const dynamicBlocksXML = this.props.vm.runtime.getBlocksXML();
        const target = this.props.vm.editingTarget;
        const toolboxXML = makeToolboxXML(target.isStage, target.id, dynamicBlocksXML);
        this.props.updateToolboxState(toolboxXML);
    }
    handleBlocksInfoUpdate (blocksInfo) {
        // @todo Later we should replace this to avoid all the warnings from redefining blocks.
        this.handleExtensionAdded(blocksInfo);
    }
    handleCategorySelected (categoryName) {
        this.workspace.toolbox_.setSelectedCategoryByName(categoryName);
    }
    setBlocks (blocks) {
        this.blocks = blocks;
    }
    handlePromptStart (message, defaultValue, callback, optTitle, optVarType) {
        const p = {prompt: {callback, message, defaultValue}};
        p.prompt.title = optTitle ? optTitle :
            this.ScratchBlocks.VARIABLE_MODAL_TITLE;
        p.prompt.showMoreOptions =
            optVarType !== this.ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE;
        this.setState(p);
    }
    handlePromptCallback (data) {
        this.state.prompt.callback(data);
        this.handlePromptClose();
    }
    handlePromptClose () {
        this.setState({prompt: null});
    }
    handleCustomProceduresClose (data) {
        this.props.onRequestCloseCustomProcedures(data);
        const ws = this.workspace;
        ws.refreshToolboxSelection_();
        // @todo ensure this does not break on localization
        ws.toolbox_.scrollToCategoryByName('My Blocks');
    }
    render () {
        /* eslint-disable no-unused-vars */
        const {
            customProceduresVisible,
            extensionLibraryVisible,
            options,
            vm,
            isVisible,
            onActivateColorPicker,
            updateToolboxState,
            onActivateCustomProcedures,
            onRequestCloseExtensionLibrary,
            onRequestCloseCustomProcedures,
            toolboxXML,
            ...props
        } = this.props;
        /* eslint-enable no-unused-vars */
        return (
            <div>
                <BlocksComponent
                    componentRef={this.setBlocks}
                    {...props}
                />
                {this.state.prompt ? (
                    <Prompt
                        label={this.state.prompt.message}
                        placeholder={this.state.prompt.defaultValue}
                        showMoreOptions={this.state.prompt.showMoreOptions}
                        title={this.state.prompt.title}
                        onCancel={this.handlePromptClose}
                        onOk={this.handlePromptCallback}
                    />
                ) : null}
                {extensionLibraryVisible ? (
                    <ExtensionLibrary
                        vm={vm}
                        onCategorySelected={this.handleCategorySelected}
                        onRequestClose={onRequestCloseExtensionLibrary}
                    />
                ) : null}
                {customProceduresVisible ? (
                    <CustomProcedures
                        options={{
                            media: options.media
                        }}
                        onRequestClose={this.handleCustomProceduresClose}
                    />
                ) : null}
            </div>
        );
    }
}

Blocks.propTypes = {
    customProceduresVisible: PropTypes.bool,
    extensionLibraryVisible: PropTypes.bool,
    isVisible: PropTypes.bool,
    locale: PropTypes.string,
    messages: PropTypes.objectOf(PropTypes.string),
    onActivateColorPicker: PropTypes.func,
    onActivateCustomProcedures: PropTypes.func,
    onRequestCloseCustomProcedures: PropTypes.func,
    onRequestCloseExtensionLibrary: PropTypes.func,
    options: PropTypes.shape({
        media: PropTypes.string,
        zoom: PropTypes.shape({
            controls: PropTypes.bool,
            wheel: PropTypes.bool,
            startScale: PropTypes.number
        }),
        colours: PropTypes.shape({
            workspace: PropTypes.string,
            flyout: PropTypes.string,
            toolbox: PropTypes.string,
            toolboxSelected: PropTypes.string,
            scrollbar: PropTypes.string,
            scrollbarHover: PropTypes.string,
            insertionMarker: PropTypes.string,
            insertionMarkerOpacity: PropTypes.number,
            fieldShadow: PropTypes.string,
            dragShadowOpacity: PropTypes.number
        }),
        comments: PropTypes.bool,
        collapse: PropTypes.bool
    }),
    toolboxXML: PropTypes.string,
    updateToolboxState: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

Blocks.defaultOptions = {
    zoom: {
        controls: true,
        wheel: true,
        startScale: 0.675
    },
    grid: {
        spacing: 40,
        length: 2,
        colour: '#ddd'
    },
    colours: {
        workspace: '#F9F9F9',
        flyout: '#F9F9F9',
        toolbox: '#FFFFFF',
        toolboxSelected: '#E9EEF2',
        scrollbar: '#CECDCE',
        scrollbarHover: '#CECDCE',
        insertionMarker: '#000000',
        insertionMarkerOpacity: 0.2,
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6
    },
    comments: false,
    collapse: false
};

Blocks.defaultProps = {
    isVisible: true,
    options: Blocks.defaultOptions
};

const mapStateToProps = state => ({
    extensionLibraryVisible: state.modals.extensionLibrary,
    locale: state.intl.locale,
    messages: state.intl.messages,
    toolboxXML: state.toolbox.toolboxXML,
    customProceduresVisible: state.customProcedures.active
});

const mapDispatchToProps = dispatch => ({
    onActivateColorPicker: callback => dispatch(activateColorPicker(callback)),
    onActivateCustomProcedures: (data, callback) => dispatch(activateCustomProcedures(data, callback)),
    onRequestCloseExtensionLibrary: () => {
        dispatch(closeExtensionLibrary());
    },
    onRequestCloseCustomProcedures: data => {
        dispatch(deactivateCustomProcedures(data));
    },
    updateToolboxState: toolboxXML => {
        dispatch(updateToolbox(toolboxXML));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Blocks);
