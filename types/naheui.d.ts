declare module 'naheui' {
    interface Aheui {}
    namespace Aheui {
        type Cho =
            'ㄱ' | 'ㄲ' | 'ㄴ' | 'ㄷ' | 'ㄸ' |
            'ㄹ' | 'ㅁ' | 'ㅂ' | 'ㅃ' | 'ㅅ' |
            'ㅆ' | 'ㅇ' | 'ㅈ' | 'ㅉ' | 'ㅊ' |
            'ㅋ' | 'ㅌ' | 'ㅍ' | 'ㅎ';
        type Jung =
            'ㅏ' | 'ㅐ' | 'ㅑ' | 'ㅒ' | 'ㅓ' |
            'ㅔ' | 'ㅕ' | 'ㅖ' | 'ㅗ' | 'ㅘ' |
            'ㅙ' | 'ㅚ' | 'ㅛ' | 'ㅜ' | 'ㅝ' |
            'ㅞ' | 'ㅟ' | 'ㅠ' | 'ㅡ' | 'ㅢ' |
            'ㅣ';
        type Jong =
            '' | 'ㄱ' | 'ㄲ' | 'ㄳ' | 'ㄴ' |
            'ㄵ' | 'ㄶ' | 'ㄷ' | 'ㄹ' | 'ㄺ' |
            'ㄻ' | 'ㄼ' | 'ㄽ' | 'ㄾ' | 'ㄿ' |
            'ㅀ' | 'ㅁ' | 'ㅂ' | 'ㅄ' | 'ㅅ' |
            'ㅆ' | 'ㅇ' | 'ㅈ' | 'ㅊ' | 'ㅋ' |
            'ㅌ' | 'ㅍ' | 'ㅎ';
        type Speed = number | undefined | 'reflect';
        export const choTable: Cho[];
        export const jungTable: Jung[];
        export const jongTable: Jong[];
        export const parameterCounts: number[];
        export const xSpeedTable: Speed[];
        export const ySpeedTable: Speed[];
        export const strokeCountTable: number[];
        export const operationMap: {
            [op: string /* Cho */]: (machine: Machine, jong: Jong) => boolean,
        };
        export function isAheuiCode(code: string): boolean;
        export function isComment(code: string): boolean;
        export function cho(code: number | string | Code): number;
        export function jung(code: number | string | Code): number;
        export function jong(code: number | string | Code): number;
        export function code(char: string): Code;
        export function codeSpace(sourceCode: string): CodeSpace;
        interface Code {
            char: string;
            cho: number;
            jung: number;
            jong: number;
            toString(): string;
        }
        type CodeSpace = Code[][];
        export class Machine {
            constructor(codeSpace: CodeSpace);
            terminated: boolean;
            cursor: Cursor;
            storage: Storage;
            run(terminateFunction: (result: number) => void): void;
            step(): StepResult;
            input(type: 'number' | 'character'): number;
            output(value: string | number): void;
            getStorage(code: number | string | Code): Storage;
            selectStorage(code: number | string | Code): void;
            dump(format?: DumpFormat): string;
        }
        export class Cursor {
            x: number;
            y: number;
            xSpeed: number;
            ySpeed: number;
            constructor(
                x?: number,
                y?: number,
                xSpeed?: number,
                ySpeed?: number,
            );
            point(codeSpace: CodeSpace): Code | void;
            turn(jung: Jung): TurnResult;
            reflect(): ReflectResult;
            move(codeSpace: CodeSpace): MoveResult;
        }
        export class Storage {
            constructor(type: 'stack' | 'queue' | 'pipe');
            push(value: number): void;
            pop(): number;
            duplicate(): number;
            swap(): void;
            send(to: Storage): void;
            count(): number;
            dump(format?: StorageDumpFormat): string;
        }
        type DumpFormat =
            'classic' | 'classic korean' |
            'jsaheui' | 'jsaheui korean' |
            'classic english' | 'jsaheui english';
        type StorageDumpFormat = 'csv' | 'csv reversed';
        interface StepResult {
            cursorTurnResult: TurnResult | null;
            cursorReflectResult: ReflectResult | null;
            cursorMoveResult: MoveResult | null;
        }
        interface TurnResult {
            xReflected: boolean;
            yReflected: boolean;
            xTurned: boolean;
            yTurned: boolean;
        }
        interface ReflectResult {
            xReflected: boolean;
            yReflected: boolean;
        }
        interface MoveResult {
            xSpeed: number;
            ySpeed: number;
            xWrapped: boolean;
            yWrapped: boolean;
        }
    }
    export = Aheui;
}
