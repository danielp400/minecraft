export default class Block {
    constructor({ id, name, type, resistance, transparent, solid, texture, color }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.resistance = resistance;
        this.transparent = transparent;
        this.solid = solid;
        this.texture = texture;
        this.color = color || 0xffffff;
    }
}
