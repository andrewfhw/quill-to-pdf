import { Style } from "./interfaces";

export let styles: Style = {
    normal: {
        font: 'Times-Roman',
        fontSize: 12,
        baseIndent: 72,
        levelIndent: 0,
    },
    header_1: {
        font: 'Helvetica-Bold',
        fontSize: 16,
        baseIndent: 72,
        levelIndent: 0
    },
    header_2: {
        font: 'Helvetica-Bold',
        fontSize: 14,
        baseIndent: 72,
        levelIndent: 0
    },
    block_quote: {
        font: 'Times-Italic',
        fontSize: 12,
        italics: true,
        baseIndent: 72,
        levelIndent: 0,
        indent: {
            left: 0,
            right: 0
        }
    },
    code_block: {
        font: 'Courier',
        fontSize: 12,
        baseIndent: 72,
        levelIndent: 0
    },
    list_paragraph: {
        font: 'Times-Roman',
        fontSize: 12,
        baseIndent: 50,
        levelIndent: 25
    },
    citation: {
        font: 'Times-Roman',
        fontSize: 12,
        baseIndent: 72,
        levelIndent: 0
    }
};

export const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100'];

export const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj', 'kk', 'll', 'mm', 'nn', 'oo', 'pp', 'qq', 'rr', 'ss', 'tt', 'uu', 'vv', 'ww', 'xx', 'yy', 'zz'];

export const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi', 'xxvii', 'xxviii', 'xxix', 'xxx', 'xxxi', 'xxxii', 'xxxiii', 'xxxiv', 'xxxv', 'xxxvi', 'xxxvii', 'xxxviii', 'xxxix', 'xl', 'xli', 'xlii', 'xliii', 'xliv', 'xlv', 'xlvi', 'xlvii', 'xlviii', 'xlix', 'l'];