import AppError from '@shared/errors/AppError';

import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import UpdateProfileService from './UpdateProfileService';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let updateProfile: UpdateProfileService;

describe('UpdateProfile', () => {
    beforeEach(() => {
        fakeUsersRepository = new FakeUsersRepository();
        fakeHashProvider = new FakeHashProvider();

        updateProfile = new UpdateProfileService(
            fakeUsersRepository,
            fakeHashProvider,
        );
    });

    it('Should be able update the profile', async () => {
        const user = await fakeUsersRepository.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '5151515'
        });

        const updatedUser = await updateProfile.execute({
            user_id: user.id,
            name: 'John Trê',
            email: 'johntre@example.com',
        });

        expect(updatedUser.name).toBe('John Trê');
        expect(updatedUser.email).toBe('johntre@example.com');
    });

    it('Should not be able update the profile from non-existing user', async () => {
        expect(
            updateProfile.execute({
                name: 'teste',
                email: 'test@example.com',
                user_id: 'non-existing-user',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('Should not be able to change to another user email', async () => {
        await fakeUsersRepository.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '5151515'
        });

        const user = await fakeUsersRepository.create({
            name: 'Test',
            email: 'test@example.com',
            password: '123456'
        });

        await expect(
            updateProfile.execute({
                user_id: user.id,
                name: 'John Doe',
                email: 'johndoe@example.com',
            })
        ).rejects.toBeInstanceOf(AppError);
    });

    it('Should be able to update the password', async () => {
        const user = await fakeUsersRepository.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '123456'
        });

        const updatedUser = await updateProfile.execute({
            user_id: user.id,
            name: 'John Trê',
            email: 'johntre@example.com',
            old_password: '123456',
            password: '123123',
        });

        expect(updatedUser.password).toBe('123123');
    });

    it('Should be able to update the password without old password', async () => {
        const user = await fakeUsersRepository.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '123456'
        });

        await expect(
            updateProfile.execute({
                user_id: user.id,
                name: 'John Trê',
                email: 'johntre@example.com',
                password: '123123',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('Should be able to update the password with wrong old password', async () => {
        const user = await fakeUsersRepository.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '123456'
        });

        await expect(
            updateProfile.execute({
                user_id: user.id,
                name: 'John Trê',
                email: 'johntre@example.com',
                old_password: 'wrong-old-password',
                password: '123123',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });
});
