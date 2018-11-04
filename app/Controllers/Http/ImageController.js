'use strict'

const Property = use('App/Models/Property')
const Helpers = use('Helpers')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Create/save a new image.
   * POST images
   */
  async store({
    params,
    request
  }) {
    const property = await Property.findOrFail(params.id)

    const images = request.file('image', {
      types: ['image'],
      size: '2mb'
    })

    await images.movedAll(Helpers.tmpPath('uploads'), file => ({
      name: `${Date.now()}-${file.clientName}`
    }))

    //Erro ao salvar os arquivos, retorna erro no response
    if (!images.movedAll()) {
      return images.errors()
    }

    await Promise.all(
      images
      .movedList()
      .map(image => property.images().create({
        path: image.fileName
      }))
    )
  }

  async show({
    params,
    response
  }) {
    return response.download(Helpers.tmpPath(`uploads/${params.path}`))
  }
}

module.exports = ImageController
