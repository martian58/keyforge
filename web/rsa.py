import random
import json
from math import gcd

class RSA:
    def generate_key_pair(self, key_size=512):
        p = self._generate_large_prime(key_size)
        q = self._generate_large_prime(key_size)
        n = p * q
        phi = (p - 1) * (q - 1)

        e = 65537
        while gcd(e, phi) != 1:
            e = random.randrange(3, phi, 2)

        d = pow(e, -1, phi)
        return ((e, n), (d, n))

    def encrypt(self, plaintext: str, public_key: str) -> str:
        key_data = json.loads(public_key)  # public_key is a JSON string like '{"e": "...", "n": "..."}'
        e = int(key_data["e"])
        n = int(key_data["n"])
        cipher = [pow(ord(char), e, n) for char in plaintext]
        return ','.join(map(str, cipher))


    def decrypt(self, ciphertext: str, private_key: str) -> str:
        key_data = json.loads(private_key)  # public_key is a JSON string like '{"e": "...", "n": "..."}'
        d = int(key_data["d"])
        n = int(key_data["n"])
        numbers = list(map(int, ciphertext.split(',')))
        return ''.join([chr(pow(c, d, n)) for c in numbers])


    def _generate_large_prime(self, bits):
        while True:
            p = random.getrandbits(bits)
            if self._is_prime(p):
                return p

    def _is_prime(self, n, k=5):
        if n < 2: return False
        for _ in range(k):
            a = random.randint(2, n - 2)
            if pow(a, n - 1, n) != 1:
                return False
        return True
