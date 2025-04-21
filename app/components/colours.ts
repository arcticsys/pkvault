export interface GenerationColour {
    base: string;
    hover: string;
    selected: string;
}

export interface GenerationColours {
    [key: number]: GenerationColour;
}

export const generationcolours: GenerationColours = {
    1: {
        base: 'rgb(172, 211, 108)',
        hover: 'rgb(152, 191, 88)',
        selected: 'rgb(132, 171, 68)'
    },
    2: {
        base: 'rgb(220, 214, 119)',
        hover: 'rgb(200, 194, 99)',
        selected: 'rgb(180, 174, 79)'
    },
    3: {
        base: 'rgb(156, 215, 200)',
        hover: 'rgb(136, 195, 180)',
        selected: 'rgb(116, 175, 160)'
    },
    4: {
        base: 'rgb(183, 163, 195)',
        hover: 'rgb(163, 143, 175)',
        selected: 'rgb(143, 123, 155)'
    },
    5: {
        base: 'rgb(159, 202, 223)',
        hover: 'rgb(139, 182, 203)',
        selected: 'rgb(119, 162, 183)'
    },
    6: {
        base: 'rgb(221, 96, 140)',
        hover: 'rgb(201, 76, 120)',
        selected: 'rgb(181, 56, 100)'
    },
    7: {
        base: 'rgb(232, 148, 131)',
        hover: 'rgb(212, 128, 111)',
        selected: 'rgb(192, 108, 91)'
    },
    8: {
        base: 'rgb(201, 125, 192)',
        hover: 'rgb(181, 105, 172)',
        selected: 'rgb(161, 85, 152)'
    },
    9: {
        base: 'rgb(235, 192, 129)',
        hover: 'rgb(215, 172, 109)',
        selected: 'rgb(195, 152, 89)'
    }
};

export const uploadtypecolours = {
    file: {
        base: 'rgb(172, 211, 108)',
        hover: 'rgb(152, 191, 88)',
        selected: 'rgb(132, 171, 68)'
    },
    folder: {
        base: 'rgb(220, 214, 119)',
        hover: 'rgb(200, 194, 99)',
        selected: 'rgb(180, 174, 79)'
    },
    ftp: {
        base: 'rgb(156, 215, 200)',
        hover: 'rgb(136, 195, 180)',
        selected: 'rgb(116, 175, 160)'
    }
};

export function getgencolour(generation: number, isSelected: boolean, isHovered: boolean): string {
    const gencolours = generationcolours[generation];

    if (!gencolours) {
        return '#cccccc';
    }

    if (isSelected) {
        return gencolours.selected;
    }

    if (isHovered) {
        return gencolours.hover;
    }

    return gencolours.base;
}

export function getuploadtypecolour(type: 'file' | 'folder' | 'ftp', isSelected: boolean, isHovered: boolean): string {
    const typecolours = uploadtypecolours[type];

    if (!typecolours) {
        return '#cccccc';
    }

    if (isSelected) {
        return typecolours.selected;
    }

    if (isHovered) {
        return typecolours.hover;
    }

    return typecolours.base;
}