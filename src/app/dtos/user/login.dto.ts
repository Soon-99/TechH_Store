import {
    IsString, 
    IsNotEmpty, 
} from 'class-validator';

export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    password: string;


    constructor(data: any) {
        this.userName = data.userName;
        this.password = data.password;
    }
}