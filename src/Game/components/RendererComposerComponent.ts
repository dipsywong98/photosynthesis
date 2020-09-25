import { RefPropType, Types } from 'ecsy'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { WebGLRendererComponent } from 'ecsy-three'
import { Camera, Object3D, WebGLRenderer } from 'three'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

export default class RendererComposerComponent extends WebGLRendererComponent {
  composer!: EffectComposer
  outlinePass!: OutlinePass
  effectFXAA!: ShaderPass

  static schema: {
    composer: { type: RefPropType<EffectComposer> }
    renderer: { type: RefPropType<WebGLRenderer> }
    scene: { type: RefPropType<Object3D> } // this is wrong, but lib also wrong
    camera: { type: RefPropType<Camera> } // this is wrong, but lib also wrong
    outlinePass: { type: RefPropType<OutlinePass> }
    effectFXAA: { type: RefPropType<ShaderPass>}
  }
}

RendererComposerComponent.schema = {
  composer: { type: Types.Ref as RefPropType<EffectComposer> },
  renderer: { type: Types.Ref as RefPropType<WebGLRenderer> },
  scene: { type: Types.Ref as RefPropType<Object3D> }, // this is wrong, but lib also wrong
  camera: { type: Types.Ref as RefPropType<Camera> }, // this is wrong, but lib also wrong
  outlinePass: { type: Types.Ref as RefPropType<OutlinePass> },
  effectFXAA: { type: Types.Ref as RefPropType<ShaderPass> }
}
