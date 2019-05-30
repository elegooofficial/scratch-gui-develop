import PropTypes from 'prop-types';
import React from 'react';

import VM from 'scratch-vm';

import SpriteLibrary from '../../containers/sprite-library.jsx';
import SpriteSelectorComponent from '../sprite-selector/sprite-selector.jsx';
import StageSelector from '../../containers/stage-selector.jsx';

import styles from './target-pane.css';

/*
 * Pane that contains the sprite selector, sprite info, stage selector,
 * and the new sprite, costume and backdrop buttons
 * @param {object} props Props for the component
 * @returns {React.Component} rendered component
 */
const TargetPane = ({
    editingTarget,
    hoveredTarget,
    spriteLibraryVisible,
    onChangeSpriteDirection,
    onChangeSpriteName,
    onChangeSpriteSize,
    onChangeSpriteVisibility,
    onChangeSpriteX,
    onChangeSpriteY,
    onDeleteSprite,
    onDuplicateSprite,
    onNewSpriteClick,
    onSurpriseSpriteClick,
    onPaintSpriteClick,
    onRequestCloseSpriteLibrary,
    onSelectSprite,
    raiseSprites,
    stage,
    sprites,
    vm,
    ...componentProps
}) => (
    <div
        className={styles.targetPane}
        {...componentProps}
    >

        <SpriteSelectorComponent
            editingTarget={editingTarget}
            hoveredTarget={hoveredTarget}
            raised={raiseSprites}
            selectedId={editingTarget}
            sprites={sprites}
            onChangeSpriteDirection={onChangeSpriteDirection}
            onChangeSpriteName={onChangeSpriteName}
            onChangeSpriteSize={onChangeSpriteSize}
            onChangeSpriteVisibility={onChangeSpriteVisibility}
            onChangeSpriteX={onChangeSpriteX}
            onChangeSpriteY={onChangeSpriteY}
            onDeleteSprite={onDeleteSprite}
            onDuplicateSprite={onDuplicateSprite}
            onNewSpriteClick={onNewSpriteClick}
            onPaintSpriteClick={onPaintSpriteClick}
            onSelectSprite={onSelectSprite}
            onSurpriseSpriteClick={onSurpriseSpriteClick}
        />
        <div className={styles.stageSelectorWrapper}>
            {stage.id && <StageSelector
                assetId={
                    stage.costume &&
                    stage.costume.assetId
                }
                backdropCount={stage.costumeCount}
                id={stage.id}
                selected={stage.id === editingTarget}
                onSelect={onSelectSprite}
            />}
            <div>
                {spriteLibraryVisible ? (
                    <SpriteLibrary
                        vm={vm}
                        onRequestClose={onRequestCloseSpriteLibrary}
                    />
                ) : null}
            </div>
        </div>
    </div>
);

const spriteShape = PropTypes.shape({
    costume: PropTypes.shape({
        url: PropTypes.string,
        name: PropTypes.string.isRequired,
        bitmapResolution: PropTypes.number.isRequired,
        rotationCenterX: PropTypes.number.isRequired,
        rotationCenterY: PropTypes.number.isRequired
    }),
    direction: PropTypes.number,
    id: PropTypes.string,
    name: PropTypes.string,
    order: PropTypes.number,
    size: PropTypes.number,
    visibility: PropTypes.bool,
    x: PropTypes.number,
    y: PropTypes.number
});

TargetPane.propTypes = {
    editingTarget: PropTypes.string,
    extensionLibraryVisible: PropTypes.bool,
    hoveredTarget: PropTypes.shape({
        hoveredSprite: PropTypes.string,
        receivedBlocks: PropTypes.bool
    }),
    onChangeSpriteDirection: PropTypes.func,
    onChangeSpriteName: PropTypes.func,
    onChangeSpriteSize: PropTypes.func,
    onChangeSpriteVisibility: PropTypes.func,
    onChangeSpriteX: PropTypes.func,
    onChangeSpriteY: PropTypes.func,
    onDeleteSprite: PropTypes.func,
    onDuplicateSprite: PropTypes.func,
    onNewSpriteClick: PropTypes.func,
    onPaintSpriteClick: PropTypes.func,
    onRequestCloseExtensionLibrary: PropTypes.func,
    onRequestCloseSpriteLibrary: PropTypes.func,
    onSelectSprite: PropTypes.func,
    onSurpriseSpriteClick: PropTypes.func,
    raiseSprites: PropTypes.bool,
    spriteLibraryVisible: PropTypes.bool,
    sprites: PropTypes.objectOf(spriteShape),
    stage: spriteShape,
    vm: PropTypes.instanceOf(VM)
};

export default TargetPane;
