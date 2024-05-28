import { Layer, Pack, Sticker } from "./types"
import { removeBackground } from "@imgly/background-removal"
import JSZip from "jszip";
import { Stores, getStoreData } from "./db";
import html2canvas from "html2canvas";

export const getImgDimensions = ( base64: string ) => {
  return new Promise<{width: number, height: number}>(resolve => {
    let img = new Image()
    img.src = base64

    img.onload = () => {
      resolve({width: img.width, height: img.height});
    }
  })
}

export const translateLayer = (layer: Layer, dx: number, dy: number): Partial<Layer> => {
  return {
    top: layer.top + dy,
    left: layer.left + dx,
  }
}

export const rotateLayer = (rect: DOMRect, clientX: number, clientY: number): Partial<Layer> => {
  const center = { 
    x: ( rect.left + rect.right ) / 2,
    y: ( rect.top + rect.bottom ) / 2, 
  }
  return {
    rotation: Math.atan2(clientY - center.y, clientX - center.x) * 180 / Math.PI + 90,
  }
}

export const resizeLayer = (layer: Layer, _dx: number, _dy: number, type: "resize-tl" | "resize-tr" | "resize-bl" | "resize-br"): Partial<Layer> => {
  const dx = type === "resize-br" || type === "resize-tr" ? _dx : -_dx;
  const dy = type === "resize-br" || type === "resize-bl" ? _dy : -_dy;
  const ratio = layer.width / layer.height;
  const width = Math.abs(dx) > Math.abs(dy) ? layer.width + dx : ((layer.height + dy) * ratio);
  const height = Math.abs(dx) <= Math.abs(dy) ? layer.height + dy : ((layer.width + dx) / ratio );
  const top = type === "resize-bl" || type === "resize-br" ? layer.top : ( layer.top - height + layer.height )
  const left = type === "resize-tr" || type === "resize-br" ? layer.left : ( layer.left - width + layer.width )
  
  return {
    width,
    height,
    top,
    left,
  }
}

export const cropLayer = (layer: Layer, _dx: number, _dy: number, type: "crop-tl" | "crop-tr" | "crop-bl" | "crop-br"): Partial<Layer> => {
  const __dx = type === "crop-br" || type === "crop-tr" ? _dx : -_dx;
  const __dy = type === "crop-br" || type === "crop-bl" ? _dy : -_dy;
  const dx = __dx * Math.cos(layer.rotation / 180 * Math.PI) + __dy * Math.sin(layer.rotation / 180 * Math.PI) 
  const dy = __dy * Math.cos(layer.rotation / 180 * Math.PI) + __dx * Math.sin(layer.rotation / 180 * Math.PI) 
  const maxWidth = layer._width / layer.croppedWidth * layer.width
  const maxHeight = layer._height / layer.croppedHeight * layer.height
  const width = Math.min(maxWidth, Math.max(1, layer.width + dx ) )
  const height = Math.min(maxHeight, Math.max(1, layer.height + dy) )
  const croppedWidth = width / maxWidth * layer._width 
  const croppedHeight = height / maxHeight * layer._height
  const croppedTop = type === "crop-bl" || type === "crop-br" ? layer.croppedTop : ( layer.croppedTop - croppedHeight + layer.croppedHeight )
  const croppedLeft = type === "crop-tr" || type === "crop-br" ? layer.croppedLeft : ( layer.croppedLeft - croppedWidth + layer.croppedWidth )
  const top = type === "crop-bl" || type === "crop-br" ? layer.top : ( layer.top - height + layer.height )
  const left = type === "crop-tr" || type === "crop-br" ? layer.left : ( layer.left - width + layer.width )

  return {
    top,
    left,
    width,
    height,
    croppedHeight,
    croppedWidth,
    croppedLeft,
    croppedTop,
  }
}

export const cropTranslate = (layer: Layer, dx: number, dy: number): Partial<Layer> => {
  const maxWidth = layer._width / layer.croppedWidth * layer.width
  const maxHeight = layer._height / layer.croppedHeight * layer.height
  const croppedLeft = Math.max(0, Math.min(layer.croppedLeft + dx / maxWidth * layer._width, layer._width - layer.croppedWidth))
  const croppedTop = Math.max(0, Math.min(layer.croppedTop + dy / maxHeight * layer._height, layer._height - layer.croppedHeight))
  
  const cornerTop = layer.top - layer.croppedTop / layer.croppedHeight * layer.height
  const cornerLeft = layer.left - layer.croppedLeft / layer.croppedWidth * layer.width

  return {
    top: Math.max(cornerTop, Math.min( layer.top + dy, cornerTop + maxHeight - layer.height )),
    left: Math.max(cornerLeft, Math.min( layer.left + dx, cornerLeft + maxWidth - layer.width )),
    croppedLeft,
    croppedTop,
  }
}

export const removeLayerBackground = ({content}: Layer): Promise<Partial<Layer>> => {
  return removeBackground(content, {proxyToWorker: true}).then(blob => {
    return new Promise<Partial<Layer>>(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => resolve({content: reader.result as string})
      reader.onerror = () => resolve({content})
      reader.readAsDataURL(blob)
    })
  })
}

export const addStrokeEffect = ({content, _height, _width}: Layer, color: string, s: number): Promise<Partial<Layer>> => {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    canvas.height = _height;
    canvas.width = _width;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1] // offset array
      const x = 0  // final position
      const y = 0

      // draw images at offsets from the array scaled by s
      for(let i=0; i < dArr.length; i += 2)
        ctx.drawImage(img, x + dArr[i]*s, y + dArr[i+1]*s);

      // fill with color
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = color;
      ctx.fillRect(0,0, _width, _height);

      // draw original image in normal mode
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, x, y);
      resolve({content: canvas.toDataURL()});
    }
    img.src = content;
    img.setAttribute('crossorigin', 'anonymous')
  })
}

export const getImageFromLayers = async (layers: Layer[]) => {
  const base = document.querySelector("#html2canvas")! as HTMLDivElement
  base.innerHTML = "";
  base.style.width = "500px"
  base.style.height = "500px"
  base.style.position = "absolute"
  for ( const layer of layers ) {
    const layerDiv = document.createElement("div")
    layerDiv.style.width = `${layer.width}px`
    layerDiv.style.height = `${layer.height}px`
    layerDiv.style.position = "absolute"
    layerDiv.style.backgroundRepeat = "no-repeat"
    layerDiv.style.backgroundImage = `url(${layer.content})`
    layerDiv.style.backgroundSize = `${layer._width / layer.croppedWidth * layer.width}px ${layer._height / layer.croppedHeight * layer.height}px`
    layerDiv.style.backgroundPositionX = `-${layer.croppedLeft / layer.croppedWidth * layer.width}`
    layerDiv.style.backgroundPositionY = `-${layer.croppedTop / layer.croppedHeight * layer.height}`
    layerDiv.style.transform = `rotate(${layer.rotation}deg)`
    base.appendChild(layerDiv)
  }
  return await html2canvas(base, { scale: 2, backgroundColor: null }).then(canvas => canvas.toDataURL())
}

export const zipPack = (packId: string) => (
  getStoreData<Pack>(Stores.Packs, packId).then(async (pack) => {
    const zip = new JSZip()
    const stickers = await Promise.all(pack.stickerIds.map(stickerId => getStoreData<Sticker>(Stores.Stickers, stickerId)))
    console.log(stickers)
    zip.file("meta.json", JSON.stringify({
      title: pack.title,
      author: pack.author,
      tags: pack.tags,
      stickers: stickers.map((({id, emoji}) => ({
        file: `${id}.png`,
        emoji,
      })))
    }))
    const stickersFolder = zip.folder('stickers')
    for ( const sticker of stickers ) {
      const base64 = await getImageFromLayers(sticker.layers)
      stickersFolder?.file(`${sticker.id}.png`, base64.replace(/^data:image\/?[A-z]*;base64,/, ""), {base64: true});
    }
    return zip.generateAsync({type: "blob"})
  })
)