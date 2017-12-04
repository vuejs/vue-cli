import vertexShaderSource from './webgl/vertexShader.glsl'

class WebGL2 {
  constructor() {
    this.isSupported = false

    this.vertexShader = null

    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.context = this.canvas.getContext('webgl2')

      const gl = this.context
      if (gl) {
        this.isSupported = true
        gl.getExtension('EXT_color_buffer_float')
        this.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE)
        this.MAX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
        this.init()
      } else {
        console.log('Unable to initialize WebGL2 -- your browser may not support it.')
      }
    }

    this._refs = { textures: [], buffers: [] }
  }

  /**
   * Intialization after WebGL2 detected.
   */
  init() {
    this.createCommonVertexShader()
  }

  /**
   * Creates and compiles passthrough vertex shader that we will attach
   * to all our programs.
   */
  createCommonVertexShader() {
    const gl = this.context

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)
    if (!success) {
      console.error(gl.getShaderInfoLog(vertexShader))
      gl.deleteShader(vertexShader)
      this.isSupported = false
    }

    this.vertexShader = vertexShader
  }

  /**
   * Compiles fragment shader from source and creates program from it,
   * using our passthrough vertex shader.
   *
   * @param {string} source - fragment shader GLSL source code
   * @returns {WebGLProgram}
   */
  compileProgram(source) {
    const gl = this.context

    // create and compile fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, source)
    gl.compileShader(fragmentShader)

    let success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)
    if (!success) {
      console.error(gl.getShaderInfoLog(fragmentShader))
      gl.deleteShader(fragmentShader)
      this.isSupported = false
    }

    // create program and attach compiled shaders
    const program = gl.createProgram()
    gl.attachShader(program, this.vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
      console.error(gl.getProgramInfoLog(program))
      this.isSupported = false
    }

    this.setupVertices(program)
    return program
  }

  /**
   * Setup vertices
   *
   * @param {WebGLProgram} program
   */
  setupVertices(program) {
    const gl = this.context

    const position = gl.getAttribLocation(program, 'position')
    const positionVertexObj = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionVertexObj)
    this.storeRef('buffer', positionVertexObj)

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0]),
      gl.STATIC_DRAW
    )
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(position)

    const texcoord = gl.getAttribLocation(program, 'texcoord')
    const texcoordVertexObj = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordVertexObj)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(texcoord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(texcoord)
    this.storeRef('buffer', texcoordVertexObj)

    const indicesVertexObj = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesVertexObj)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    this.storeRef('buffer', indicesVertexObj)
  }

  /**
   * Selects linked program as active program
   *
   * @param {WebGLProgram} program
   */
  selectProgram(program) {
    const gl = this.context
    gl.useProgram(program)
  }

  /**
   * Bind uniforms within program
   *
   * @param {WebGLProgram} program
   * @param {Object[]} uniforms
   */
  bindUniforms(program, uniforms) {
    const gl = this.context

    uniforms.forEach(({ value, type, name }) => {
      const loc = gl.getUniformLocation(program, name)
      if (type === 'float') {
        gl.uniform1f(loc, value)
      } else if (type === 'int' || type === 'bool') {
        gl.uniform1i(loc, value)
      }
    })
  }

  /**
   * Bind input textures within program, handling inputs that are fragmented
   *
   * @param {WebGLProgram} program
   * @param {Object[]} inputs
   * @param {number} [k]
   */
  bindInputTextures(program, inputs, k) {
    const gl = this.context

    inputs.forEach(({ input, name }, i) => {
      gl.activeTexture(gl.TEXTURE0 + i)
      if (input.glTextureFragments) {
        if (input.glTextureFragmentsAsColStack) {
          const { textureTarget } = this.getWebGLTextureOptions(input.glTextureType, input.glTextureFormat)
          gl.bindTexture(textureTarget, input.glTextureFragmentsAsColStack)
        } else {
          const { textureTarget } = this.getWebGLTextureOptions(input.glTextureType, input.glTextureFormat)
          gl.bindTexture(textureTarget, input.glTextureFragments[k])
        }
      } else {
        const { textureTarget } = this.getWebGLTextureOptions(input.glTextureType, input.glTextureFormat)
        gl.bindTexture(textureTarget, input.glTexture)
      }
      gl.uniform1i(gl.getUniformLocation(program, name), i)
    })
  }

  /**
   * Bind output texture
   *
   * @param {WebGLTexture} outputTexture
   * @param {number[]} shape
   */
  bindOutputTexture(outputTexture, shape) {
    const gl = this.context

    gl.viewport(0, 0, shape[1], shape[0])

    this.framebuffer = this.framebuffer || gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0)
  }

  /**
   * Runs fragment shader program, after binding output, inputs, and uniforms
   *
   * @param {WebGLProgram} options.program
   * @param {Tensor} options.output
   * @param {Object[]} options.inputs
   * @param {Object[]} options.uniforms
   */
  runProgram({ program, output, inputs, uniforms, supportsTextureFragments = false }) {
    if (!program) throw new Error('[WebGL2] missing program')
    if (!output) throw new Error('[WebGL2] missing output')
    if (!inputs) throw new Error('[WebGL2] missing inputs')

    const gl = this.context
    this.selectProgram(program)
    if (uniforms && Array.isArray(uniforms)) {
      this.bindUniforms(program, uniforms)
    }

    if (output.glTextureFragments) {
      if (!supportsTextureFragments) {
        throw new Error('[WebGL2] program does not support texture fragments')
      }

      const inputsWithFragments = inputs.filter(
        obj => obj.input.glTextureFragments && !obj.input.glTextureFragmentsAsColStack
      )
      const numFragments = output.glTextureFragments.length
      if (inputsWithFragments.some(obj => obj.input.glTextureFragments.length !== numFragments)) {
        throw new Error('[WebGL2] number of texture fragments in inputs and output do not match')
      }

      for (let k = 0; k < numFragments; k++) {
        this.bindOutputTexture(output.glTextureFragments[k], output.glTextureFragmentShape)
        this.bindInputTextures(program, inputs, k)
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      }
    } else {
      this.bindOutputTexture(output.glTexture, output.glTextureShape)
      this.bindInputTextures(program, inputs)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }
  }

  /**
   * Reads pixel data from framebuffer
   *
   * @param {number[]} shape
   * @returns {Float32Array}
   */
  readData(shape) {
    const gl = this.context
    const buf = new ArrayBuffer(shape[0] * shape[1] * 4 * 4)
    const view = new Float32Array(buf)
    gl.readPixels(0, 0, shape[1], shape[0], gl.RGBA, gl.FLOAT, view)
    const out = []
    for (let i = 0; i < view.length; i += 4) {
      out.push(view[i])
    }
    return new Float32Array(out)
  }

  /**
   * Gets WebGLTexture options constants
   */
  getWebGLTextureOptions(type, format) {
    const gl = this.context

    const targetMap = {
      '2d': gl.TEXTURE_2D,
      '2d_array': gl.TEXTURE_2D_ARRAY,
      '3d': gl.TEXTURE_3D
    }

    const internalFormatMap = {
      float: gl.R32F,
      int: gl.R32I
    }

    const formatMap = {
      float: gl.RED,
      int: gl.RED_INTEGER
    }

    const typeMap = {
      float: gl.FLOAT,
      int: gl.INT
    }

    const textureTarget = targetMap[type]
    const textureInternalFormat = internalFormatMap[format]
    const textureFormat = formatMap[format]
    const textureType = typeMap[format]

    return { textureTarget, textureInternalFormat, textureFormat, textureType }
  }

  /**
   * Store reference to WebGL texture or buffer on class instance, useful for when we want to delete later
   *
   * @param {string} type
   * @param {WebGLTexture|WebGLBuffer} obj
   */
  storeRef(type, obj) {
    if (type === 'texture') {
      this._refs.textures.push(obj)
    } else if (type === 'buffer') {
      this._refs.buffers.push(obj)
    }
  }

  /**
   * Deletes all stored references to WebGL textures and buffers
   */
  clearRefs() {
    const gl = this.context
    this._refs.textures.forEach(texture => gl.deleteTexture(texture))
    this._refs.buffers.forEach(buffer => gl.deleteBuffer(buffer))
    this._refs = { textures: [], buffers: [] }
  }
}

const webgl2 = new WebGL2()
const MAX_TEXTURE_SIZE = webgl2.MAX_TEXTURE_SIZE
const MAX_TEXTURE_IMAGE_UNITS = webgl2.MAX_TEXTURE_IMAGE_UNITS

export { webgl2, MAX_TEXTURE_SIZE, MAX_TEXTURE_IMAGE_UNITS }
